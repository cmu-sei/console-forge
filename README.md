_This project is still in pre-release status and does not yet have an installable NPM package. Star the repository for notifications and updates!_

# Welcome to ConsoleForge!

ConsoleForge is an [Angular](https://angular.dev/) 19+ library with a single purpose: to make serving hypervisor-hosted virtual machine console access easy and satisfying. It currently supports access to VNC and VMWare virtual machines.

# Why not take it for a test-drive?

Since ConsoleForge is all about virtual consoles, you're going to need at least one to test drive it. If you don't have easy access to a Proxmox cluster or some other hypervisor host, you can check out [this repo](https://github.com/x11vnc/x11vnc-desktop) to grab yourself a Docker image that hosts a headless VNC server.

**NOTE:** If you have Python installed locally and are a VS Code user, you can use the included VS Code Task "Run X11VNC Desktop" to pull and start the container. Easy-peasy!

# Requirements

The ConsoleForge library is built on Angular 19. Consult its [package.json](/projects/console-forge/package.json) for specific dependencies.

We don't currently support independent installation of specific hypervisor support, so when you install ConsoleForge, it includes peer dependencies for all console clients (currently, VNC and VMWare WMKS).

ConsoleForge uses [noVNC](https://www.npmjs.com/package/@novnc/novnc) for VNC client support. See this fantastic package's [documentation](https://github.com/novnc/noVNC?tab=readme-ov-file#browser-requirements) for currently-supported browsers.

## VMWare WMKS and jQuery dependencies

If your use case for ConsoleForge doesn't require the ability to connect to VMWare-hosted consoles you can ignore everything about this section. Sweet!

If it does, things are a little become slightly complex.

### jQuery

This SDK also has dependencies on jQuery and jQuery UI, which you'll also need to add to your Angular project. Depending on your use case, you can either do this through a CDN like [code.jquery.com](https://code.jquery.com/jquery-3.7.1.min.js) or via your favorite Node package manager. (Note that the HTML Console SDK's current documentation is not specific about which versions of jQuery/jQuery UI are required.) Assuming you're able to install and correctly configure the inclusion of these three dependencies, VMWare consoles in ConsoleForge should work as expected. Having trouble? [Drop as an issue and let us know.](https://github.com/cmu-sei/console-forge/issues)

### Including the HTML Console SDK's assets

We use a lightly modified version of the [VMWare HTML Console SDK](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/html-console-sdk-programming-guide.html) to deliver VMWare console support. For convenience, we include that SDK in the library. To include it in your Angular app's scripts, you'll need to update the `"styles"` and `"scripts"` sections of your `angular.json` file to include it. It'll look something like this:

```json
//snip
"styles": ["dist/console-forge/vendor/vmware-wmks/css/main-ui.css"],
// snip
"scripts": ["node_modules/console-forge/vendor/vmware-wmks/js/wmks.min.js"]
// snip
```

We make the following adjustments due to our use case:

- We include only the `main-ui.css` stylesheet in the library
- We don't include images referenced by this CSS for reasons of distribution complexity

# Building ConsoleForge

You can build your own copy of ConsoleForge using the Angular CLI (currently, 19+). Just clone:

```bash
git clone https://github.com/cmu-sei/console-forge
```

And build!

```bash
ng build console-forge
```

# Maintainers

ConsoleForge is proudly maintained by the [Software Engineering Institute](https://sei.cmu.edu/) at [Carnegie Mellon University](https://www.cmu.edu/).

# Assets

ConsoleForge's default toolbar (which can be replaced by end developers) uses SVG Icons by [thewolfkit](https://www.svgrepo.com/collection/wolf-kit-rounded-line-icons/) under the [Attribution CC BY license](https://www.svgrepo.com/page/licensing/#CC%20Attribution).

# Special thanks

Special thanks to these projects which make ConsoleForge possible!

- [noVNC](https://novnc.com/info.html)
- [x11vnc_desktop](https://hub.docker.com/r/x11vnc/docker-desktop)
