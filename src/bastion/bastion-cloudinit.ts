import {
  BASTION_INSTANCE_IN_USE_TAG_NAME,
  BASTION_INSTANCE_UPDATED_TAG_NAME,
  BASTION_INSTANCE_UPDATING_TAG_NAME,
} from './bastion.js';

export const BASTION_INSTANCE_CLOUD_INIT = `
#cloud-config
repo_update: true
repo_upgrade: all

write_files:
  - path: /opt/basti/stop-if-not-used.sh
    owner: root:root
    permissions: "0544"
    content: |
      #!/bin/bash
      
      set -e;
      
      # Stopping instance in case of any error to prevent it from running forever
      handle_error() {
        echo "[$now] Error running script. Stopping instance."
        
        /sbin/shutdown -h now
      }

      trap handle_error ERR

      now=$(date)
      echo "[$now] =========="

      export AWS_DEFAULT_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

      bastionInstanceId=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)

      echo "[$now] Retrieving last in use tag."
      lastInUse=$(aws ec2 describe-instances \
        --instance-ids $bastionInstanceId \
        --query "Reservations[0].Instances[0].Tags[?Key=='${BASTION_INSTANCE_IN_USE_TAG_NAME}'].Value" \
        --output text
      )
      inUseThreshold=$(date -d "now - 5 minutes" -u +"%Y-%m-%dT%H:%M:%SZ")

      if [[ $lastInUse < $inUseThreshold ]]; then
        echo "[$now] Instance is not in use."
        
        echo "[$now] Retrieving last updated tag."
        lastUpdated=$(aws ec2 describe-instances \
          --instance-ids $bastionInstanceId \
          --query "Reservations[0].Instances[0].Tags[?Key=='${BASTION_INSTANCE_UPDATED_TAG_NAME}'].Value" \
          --output text
        )
        lastUpdatedThreshold=$(date -d "now - 1 day" -u +"%Y-%m-%dT%H:%M:%SZ")

        if [[ $lastUpdated < $lastUpdatedThreshold ]]; then
          echo "[$now] Updating instance."

          echo "[$now] Setting updating tag."
          aws ec2 create-tags \
            --resources $bastionInstanceId \
            --tags Key=${BASTION_INSTANCE_UPDATING_TAG_NAME},Value=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

          echo "[$now] Updating packages."
          yum update -y

          echo "[$now] Setting updated tag."
          aws ec2 create-tags \
            --resources $bastionInstanceId \
            --tags Key=${BASTION_INSTANCE_UPDATED_TAG_NAME},Value=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        fi

        echo "[$now] Stopping instance."
        /sbin/shutdown -h now
      fi

      echo "[$now] Instance is in use."

  - path: /var/log/basti/stop-if-not-used.log
    owner: root:root
    permissions: "0644"
    content: ""

  - path: /etc/cron.d/stop-if-not-used
    owner: root:root
    permissions: "0444"
    content: "* * * * * root /bin/bash /opt/basti/stop-if-not-used.sh &>> /var/log/basti/stop-if-not-used.log\\n"
`;
