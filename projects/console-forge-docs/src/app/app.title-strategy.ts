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
