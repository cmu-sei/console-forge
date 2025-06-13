![NPM Version](https://img.shields.io/npm/v/%40cmusei%2Fconsole-forge)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/%40cmusei%2Fconsole-forge)

# Welcome to ConsoleForge!

ConsoleForge is an [Angular](https://angular.dev/) 19+ library with a single purpose: to make serving hypervisor-hosted virtual machine console access easy and satisfying. It currently supports access to VNC and VMWare virtual machines.

# Why not take it for a test-drive?

If you want to see what ConsoleForge can do, start by cloning our repo and installing dependencies:

```bash
git clone https://github.com/cmu-sei/console-forge.git
cd console-forge
npm i
```

Since ConsoleForge is all about virtual consoles, you're going to need at least one to test drive it. If you don't have easy access to a Proxmox cluster or some other hypervisor host, you can check out [this repo](https://github.com/x11vnc/x11vnc-desktop) to grab yourself a Docker image that hosts a headless VNC server.

**NOTE:** If you have Python installed locally and are a VS Code user, you can use the included VS Code Task "Run X11VNC Desktop" to pull and start the container. Easy-peasy!

Once you have a compatible console available, you can build the library...

```bash
ng build console-forge --watch
```

... and in a second terminal (or with `npx concurrently`, or whatever)

```bash
ng serve console-forge-docs
```

Navigate to [http://localhost:4200](http://localhost:4200). If you're running the `X11VNC` container, you should be able to access it via the "With x11VNC (Docker Image)" tab!

![X11VNC + ConsoleForge](https://raw.githubusercontent.com/cmu-sei/console-forge/refs/heads/main/projects/console-forge-docs/public/assets/screenshot.png)

# Configuring ConsoleForge in your app

ConsoleForge exposes standard configuration via its included `provideConsoleForge` function. You can inject this function where you set up your application's root injector, typically in `app.config.ts`. Here's an example from our docs app:

```typescript
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, TitleStrategy } from "@angular/router";
import { LogLevel, provideConsoleForge } from "console-forge";
import { routes } from "./app.routes";
import { AppTitleStrategy } from "./app.title-strategy";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideConsoleForge({
      canvasRecording: {
        frameRate: 30,
      },
      logThreshold: LogLevel.DEBUG,
    }),
  ],
};
```

See [the config definition](https://github.com/cmu-sei/console-forge/blob/main/projects/console-forge/src/lib/config/console-forge-config.ts) in the library for available options and defaults.

# Customizing the toolbar

ConsoleForge provides a capable toolbar out of the box, but as the only visible element of the library, we felt it important to support customization so that ConsoleForge can happily live within the design language of any app.

To create a custom toolbar, simply create your toolbar component in your Angular project:

```bash
ng generate component my-sweet-toolbar
```

Pass it your ConsoleForge configuration:

```typescript
provideConsoleForge({ consoleToolbarComponent: MySweetToolbarComponent });
```

OR just test drive it on a single console:

**app.component.ts**

```typescript
protected customToolbar = MySweetToolbarComponent;
```

**app.component.html**

```html
<!--snip -->
<cf-console [toolbarComponent]="customToolbar"></cf-console>
```

To make your toolbar any or all of the many useful things the default toolbar does, just add an input for ConsoleForge's toolbar context:

**my-sweet-toolbar.component.ts**

```typescript
public consoleContext = input.required<ConsoleToolbarContext>();
```

Questions about how to implement your toolbar? [Check out our implementation of the default one](https://github.com/cmu-sei/console-forge/blob/main/projects/console-forge/src/lib/components/console-toolbar-default/console-toolbar-default.component.ts) - it's using the same context as you are!

# Requirements

The ConsoleForge library is built on Angular 19. Consult its [package.json](/projects/console-forge/package.json) for specific dependencies.

We don't currently support independent installation of specific hypervisor support, so when you install ConsoleForge, it includes peer dependencies for all console clients (currently, VNC and VMWare WMKS).

ConsoleForge uses [noVNC](https://www.npmjs.com/package/@novnc/novnc) for VNC client support. See this fantastic package's [documentation](https://github.com/novnc/noVNC?tab=readme-ov-file#browser-requirements) for currently-supported browsers. (In general, recent versions of Chrome, Firefox, and Edge are supported. Safari is unsupported until such time as it becomes, more or less, a completely different browser.)

## VMWare WMKS and jQuery dependencies

If your use case for ConsoleForge doesn't require the ability to connect to VMWare-hosted consoles you can ignore everything about this section. Sweet!

If it does, things are a little become slightly complex.

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

### jQuery

This SDK also has dependencies on jQuery and jQuery UI, which you'll also need to add to your Angular project. Depending on your use case, you can either do this through a CDN like [code.jquery.com](https://code.jquery.com/jquery-3.7.1.min.js) or via your favorite Node package manager. (Note that the HTML Console SDK's current documentation is not specific about which versions of jQuery/jQuery UI are required.) Assuming you're able to install and correctly configure the inclusion of these three dependencies, VMWare consoles in ConsoleForge should work as expected. Having trouble? [Drop as an issue and let us know.](https://github.com/cmu-sei/console-forge/issues)

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

ConsoleForge's default toolbar (which can be replaced by end developers) uses SVG Icons by [thewolfkit](https://www.svgrepo.com/collection/wolf-kit-rounded-line-icons/) and [Iconship](https://www.svgrepo.com/collection/iconship-interface-icons/)
under the [Attribution CC BY license](https://www.svgrepo.com/page/licensing/#CC%20Attribution).

# Special thanks

Special thanks to these projects which make ConsoleForge possible!

- [noVNC](https://novnc.com/info.html)
- [x11vnc_desktop](https://hub.docker.com/r/x11vnc/docker-desktop)
