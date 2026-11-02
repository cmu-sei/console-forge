// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
    constructor(private title: Title) {
        super();
    }

    updateTitle(routerState: RouterStateSnapshot): void {
        const title = this.buildTitle(routerState);
        if (title) {
            this.title.setTitle(`${title} | ConsoleForge`);
        } else {
            this.title.setTitle("ConsoleForge");
        }
    }
}
