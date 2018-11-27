const $ = window.jQuery;

const $TABS = $('.packages-tabs-tab');
const $TABS_BUTTONS = $('.packages-menu button');
const ACTIVE_CLASS = '-active';

export default () => {

    $TABS_BUTTONS.each((index, elem) => {
        console.log($(elem).data('tab'))
        $(elem).data('idx', index)
    });

    $TABS_BUTTONS.click(({target}) => {
        $TABS_BUTTONS.removeClass(ACTIVE_CLASS);
        $(target).addClass(ACTIVE_CLASS);

        const tabId = $(target).data('tab');

        $TABS.removeClass(ACTIVE_CLASS);
        $(`#${tabId}`).addClass(ACTIVE_CLASS);
    })
}