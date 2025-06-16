#!/bin/sh

# ---- Config ----
DEV_PASSWORD="mypw"
UBUNTU_VOLUME="/home/ubuntu"

# Get current working directory and user home
CWD=$(pwd)
USER_HOME="${HOME}"

# Build command args
CMD="docker run -d --rm \
  --name x11vnc-console-forge \
  --shm-size 2g \
  -p 6080:6080 \
  -p 5950:5900 \
  --hostname x11vnc-console-forge \
  --env VNCPASS=${DEV_PASSWORD} \
  -p 2222:22 \
  -v ${CWD}:${UBUNTU_VOLUME}/shared \
  -v x11vnc_latest_config:${UBUNTU_VOLUME}/.config \
  -v x11vnc_project:${UBUNTU_VOLUME}/project \
  -w ${UBUNTU_VOLUME}/project \
  -v ${USER_HOME}/.ssh:${UBUNTU_VOLUME}/.ssh \
  --security-opt seccomp=unconfined \
  --cap-add=SYS_PTRACE \
  x11vnc/docker-desktop:latest \
  sh -c startvnc.sh"

# ---- Dry-run option ----
if [ "$1" = "--dry-run" ]; then
  echo "Command: $CMD"
  exit 0
fi

# ---- Run it ----
echo "Running X11VNC container..."
eval "$CMD"
