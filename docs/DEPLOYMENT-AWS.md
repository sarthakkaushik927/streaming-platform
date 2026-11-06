# Deploying the backend on AWS

An optional alternative to Render. It runs the backend on Amazon ECS Express Mode, using `backend/Dockerfile`. Express Mode runs the container on Fargate and sets up an Application Load Balancer with HTTPS. The load balancer supports WebSockets, which Socket.IO needs.

**These steps create resources that cost money.** Only run them on an AWS account you own or have permission to use. Check current pricing and command options in the AWS documentation first.

## Limits

- **Run exactly one task.** Rooms live in memory, so a second task wouldn't see the first task's rooms. Set the minimum and maximum task count to 1.
- **Don't use AWS App Runner.** It's closed to new customers.

## What you need

- The AWS CLI, signed in to the account you're deploying to
- Docker
- A default VPC with public subnets in your chosen Region
- Your `DATABASE_URL`, `JWT_SECRET`, Gmail details and `GROQ_API_KEY`

In the commands below, replace `REGION` and `ACCOUNT_ID` with your own values.

## 1. Push the image to ECR

Run these from the `backend` folder:

```bash
aws ecr create-repository --repository-name syncstream-backend --region REGION

aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com

docker build --platform linux/amd64 -t ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/syncstream-backend:latest .
docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/syncstream-backend:latest
```

## 2. Store the secrets

Create one secret with these keys. Put the JSON in a local file so the values don't end up in your shell history, and delete the file afterwards.

```json
{
  "DATABASE_URL": "...",
  "JWT_SECRET": "...",
  "SMTP_USER": "...",
  "SMTP_PASS": "...",
  "GROQ_API_KEY": "..."
}
```

```bash
aws secretsmanager create-secret --name syncstream/backend --secret-string file://secrets.json --region REGION
```

## 3. Create the IAM roles

Express Mode needs a task execution role and an infrastructure role.

```bash
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam create-role --role-name ecsInfrastructureRoleForExpressServices --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy --role-name ecsInfrastructureRoleForExpressServices --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSInfrastructureRoleforExpressGatewayServices
```

The execution role also needs `secretsmanager:GetSecretValue` on the `syncstream/backend` secret. Add it as an inline policy, using the secret's ARN from step 2:

```bash
aws iam put-role-policy --role-name ecsTaskExecutionRole --policy-name syncstream-read-secret --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"secretsmanager:GetSecretValue","Resource":"SECRET_ARN"}]}'
```

If the next step fails with an assume-role error, wait about a minute and retry, because new roles take a moment to become usable.

## 4. Create the service

Save this as `container.json`, replacing `SECRET_ARN` and the image, and setting `CORS_ORIGIN` to your frontend URL:

```json
{
  "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/syncstream-backend:latest",
  "containerPort": 5000,
  "environment": [
    { "name": "NODE_ENV", "value": "production" },
    { "name": "CORS_ORIGIN", "value": "https://your-frontend.example" },
    { "name": "SMTP_HOST", "value": "smtp.gmail.com" },
    { "name": "SMTP_PORT", "value": "587" },
    { "name": "SMTP_SECURE", "value": "false" }
  ],
  "secrets": [
    { "name": "DATABASE_URL", "valueFrom": "SECRET_ARN:DATABASE_URL::" },
    { "name": "JWT_SECRET", "valueFrom": "SECRET_ARN:JWT_SECRET::" },
    { "name": "SMTP_USER", "valueFrom": "SECRET_ARN:SMTP_USER::" },
    { "name": "SMTP_PASS", "valueFrom": "SECRET_ARN:SMTP_PASS::" },
    { "name": "GROQ_API_KEY", "valueFrom": "SECRET_ARN:GROQ_API_KEY::" }
  ]
}
```

```bash
aws ecs create-express-gateway-service \
  --service-name syncstream-backend \
  --execution-role-arn arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole \
  --infrastructure-role-arn arn:aws:iam::ACCOUNT_ID:role/ecsInfrastructureRoleForExpressServices \
  --primary-container file://container.json \
  --health-check-path /api-docs/ \
  --scaling-target '{"minTaskCount":1,"maxTaskCount":1}' \
  --region REGION \
  --monitor-resources
```

When it finishes, the output includes the service URL, in the form `servicename.ecs.region.on.aws`.

## 5. Point the frontend at it

Set these on Vercel and redeploy the frontend:

| Variable | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://<aws-url>/api/v1` |
| `VITE_WS_URL` | `https://<aws-url>` |
| `VITE_OTP_API_BASE_URL` | Remove it, so signup codes are sent by this backend. If emails don't send, keep it pointing at the Vercel email function |

## Database

Neon works as it is. To use Amazon RDS for PostgreSQL instead, the production SSL setting verifies the database's certificate, so add the RDS certificate bundle to the image and set `NODE_EXTRA_CA_CERTS` to its path. Tables are created on startup in the `syncstream` schema.

## Removing it

Delete the Express Mode service, then the secret and the ECR repository, so they stop costing money.
