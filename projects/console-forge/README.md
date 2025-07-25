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

## Starting a compatible console

Since ConsoleForge is all about virtual consoles, you're going to need at least one to test drive it. Fortunately, this repo includes a script based on the [x11vnc_desktop](https://hub.docker.com/r/x11vnc/docker-desktop) project that does the job very nicely. If you're on a POSIX-compliant shell (i.e. on Windows, you'll need Git Bash or WSL) and are a VS Code user, you can use the included VS Code Task "Run X11VNC Desktop" to pull and start the container. Easy-peasy! See the [x11vnc_desktop](https://hub.docker.com/r/x11vnc/docker-desktop) project if our script doesn't fit your needs.

**NOTE:** If you have access to a Proxmox cluster or some other hypervisor host, you can use also connect to those consoles! Read on to start up our demo/docs app, and use the appropriate page to connect to your consoles.

## Building and debugging

Once you have a compatible console available, you can build the library...

```bash
ng build console-forge --watch
```

... and in a second terminal (or with `npx concurrently`, or whatever)

```bash
ng serve console-forge-docs
```

Navigate to [http://localhost:4200](http://localhost:4200). If you're running the `X11VNC` container, you should be able to access it via the "With x11VNC (Docker Image)" tab! If you have some other supported console host, you can use the various tabs in our little demo app to connect to your consoles.

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

# The Toolbar

ConsoleForge's `ConsoleComponent` includes a default toolbar that exposes a console's various functions to the end user (e.g. taking screenshots, going fullscreen, using the console clipboard, and so on). You can either use this default toolbar, or replace it with your own custom component.

## Setting up the default toolbar

To minimize impact on client applications using ConsoleForge, its default toolbar uses [PicoCSS](https://picocss.com/), a lightweight CSS framework. To avoid contaminating the global DOM with PicoCSS, ConsoleForge expects to find and download its assets from your app's `assets` directory. To make this happen, add this to your `angular.json` to make the included assets available in your app's `assets` directory:

```json
"assets": [
  // any other assets you might have
  {
    "glob": "**/*",
    "input": "node_modules/@cmusei/console-forge/assets",
    "output": "assets/"
  }
]
```

**NOTE:** We know this is an installation pain point and are considering alternative ways to make this happen so that modifying your angular.json isn't necessary.

## Creating a custom toolbar

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

To use ConsoleForge to connect to VMWare consoles, you'll need a copy of the [VMWare HTML Console SDK](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/html-console-sdk-programming-guide.html). For licensing reasons, we don't include this SDK with ConsoleForge. To include it in your Angular app's scripts, you'll need to update the `"styles"` and `"scripts"` sections of your `angular.json` file. Depending where you commit it to your project, it'll look something like this:

```json
//snip
"styles": ["path/to/vmware-wmks/css/main-ui.css"],
// snip
"scripts": ["path/to/vmware-wmks/js/wmks.min.js"]
// snip
```

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
