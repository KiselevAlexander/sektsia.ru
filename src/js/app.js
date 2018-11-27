import * as Components from './components';


Object.keys(Components).forEach((component) => {
    Components[component]();
});