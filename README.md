# Welcome to ConsoleForge!

ConsoleForge is an [Angular](https://angular.dev/) 19+ library with a single purpose: to make serving hypervisor-hosted virtual machine console access easy and satisfying. It currently supports access to VNC and VMWare virtual machines.

# Why not take it for a test-drive?

Since ConsoleForge is all about virtual consoles, you're going to need at least one to test drive it. If you don't have easy access to a Proxmox cluster or some other hypervisor host, you can check out [this repo](https://github.com/ConSol/docker-headless-vnc-container) to grab yourself a Docker image that hosts a headless VNC server.

# Requirements

The ConsoleForge library is built on Angular 19. Consult its [package.json](/projects/console-forge/package.json) for specific dependencies.

We don't currently support independent installation of specific hypervisor support, so when you install ConsoleForge, it includes peer dependencies for all console clients (currently, VNC and VMWare WMKS).

ConsoleForge uses [noVNC](https://www.npmjs.com/package/@novnc/novnc) for VNC client support. See this fantastic package's [documentation](https://github.com/novnc/noVNC?tab=readme-ov-file#browser-requirements) for currently-supported browsers.

# Maintainers

ConsoleForge is proudly maintained by the [Software Engineering Institute](https://sei.cmu.edu/) at [Carnegie Mellon University](https://www.cmu.edu/).
