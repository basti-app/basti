aws ssm start-session \
    --target i-012366fac104f9193 \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters '{"host":["tf-20220312113340880800000001.cluster-cvro9sjkux21.us-east-1.rds.amazonaws.com"],"portNumber":["5432"], "localPortNumber":["54545"]}'
