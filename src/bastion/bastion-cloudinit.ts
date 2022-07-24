export const BASTION_INSTANCE_CLOUD_INIT = `
#cloud-config
repo_update: true
repo_upgrade: all

write_files:
  - path: /opt/basti/stop-if-not-used.sh
    owner: root:root
    permissions: "0777"
    content: |
      #!/bin/bash
      set -e;

      export AWS_DEFAULT_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

      bastionInstanceId=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
      now=$(date)

      lastInUse=$(aws ec2 describe-instances \
        --instance-ids $bastionInstanceId \
        --query "Reservations[0].Instances[0].Tags[?Key=='basti:in-use'].Value" \
        --output text
      )
      inUseThreshold=$(date -d "now - 5 minutes" -u +"%Y-%m-%dT%H:%M:%SZ")

      if [[ $lastInUse < $inUseThreshold ]]; then
        echo "[$now] Instance is not in use. Shutting down."
        /sbin/shutdown -h now
      fi

      echo "[$now] Instance is in use."

  - path: /var/log/basti/stop-if-not-used.log
    owner: root:root
    content: ""

  - path: /etc/cron.d/stop-if-not-used
    owner: root:root
    content: "* * * * * root /bin/bash /opt/basti/stop-if-not-used.sh &>> /var/log/basti/stop-if-not-used.log\\n"
`;
