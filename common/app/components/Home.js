import { RoutedComponent } from "../../utils/component/RoutedComponent";
import { PlainComponent } from "../../utils/component/PlainComponent";

import "./Home.css";
import { PeopleCardComponent } from "./PeopleCard";
import {PeopleCard} from "./PeopleComponent";

export class HomeComponent extends RoutedComponent {
  constructor(parent, { peoples }, appRouter) {
    super(parent);
    this.peoplesService = peoples;
    this.filteredPeople = [];
    this.loading = true;
    this.query = "";
    this.peoples = [];
    this.appRouter = appRouter;
  }

  async getPeoples() {
    this.peoples = await this.peoplesService.getPeoples();
    this.loading = false;
    this.render();
  }

  get random() {
    return this.peoples[Math.floor(Math.random() * this.peoples.length)];
  }

  init() {
    const container = document.createElement("div");
    this.usernamePrompt = new PlainComponent(container);
    this.content = new PlainComponent(container);
    this.container = this.parent.appendChild(container);
    this.getPeoples();
  }

  async render() {
    if (!this.container) {
      this.init();
    }

    if (this.peoples.length < 1) {
      this.content.render(`
        <div class="people-random animation-show">
          <div class="people-list-loading home-spinner-wrapper">
            <div class="mdl-spinner mdl-js-spinner is-active"></div>
          </div>
        </div>
      `);
    } else {
      this.content.render(`
        <div class="people-random">
          <div data-people-card>
              <h1>You have ${this.peoples.length} friends. Do you know ?</h1>
          </div>
        </div>
      `);
      const randomPeopleWrapper = this.content.container.querySelector('[data-people-card]');
      //this.peopleCard = new PeopleCardComponent(randomPeopleWrapper, this.appRouter);
      //this.peopleCard.render({ people: this.random });
      randomPeopleWrapper.innerHTML += `
          <people-card
            people='${JSON.stringify(this.random)}'
            ></people-card>
      `
    }
  }
}
