const $ = window.jQuery;

const SHOWED_INFO_CLASS = '-showed'
const $SHOW_INFO_BUTTONS = $('.intensive-show-info');
const $INTENSIVES = $('.intensive');

export default () => {
    $SHOW_INFO_BUTTONS.click(({target}) => {
        const $intensive = $(target).parent();

        if (!$intensive.hasClass(SHOWED_INFO_CLASS)) {
            $INTENSIVES.removeClass(SHOWED_INFO_CLASS);
            $intensive.addClass(SHOWED_INFO_CLASS);
        } else {
            $intensive.removeClass(SHOWED_INFO_CLASS);
        }
    })
};