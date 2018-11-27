const $ = window.jQuery;
const {CLIP_CARDS} = window;

const $CLIP_CARDS = $('.clip-cards');
const $CLIP_CARDS_LIST = $('.clip-cards-list');
const $CLIP_CARDS_COUNT = $('.clip-cards-variants .count');
const $CLIP_CARDS_COST = $('.clip-cards-variants .cost');
const $CLIP_CARDS_PERIOD = $('.clip-cards-card-period .value');
const $CLIP_CARDS_PER_ONE = $('.clip-cards-cost-per-one .value');

let CURRENT_CARD = null;
let CURRENT_CARD_VARIANT = null;

const declOfNum = (number, titles) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return number + ' ' + titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
};

const createCard = ({id, name}, index) => {
    const LI = $('<li class="clip-cards-card"/>');
    const INPUT = $(`<input type="radio" name="card" id="card-${id}" value="${id}">`);
    const LABEL = $(`<label for="card-${id}">${name}</label>`);
    if (index === 0) {
        INPUT.attr('checked', 'checked');
    }
    LI.append(INPUT);
    LI.append(LABEL);
    return LI;
};

const setVariantParams = () => {
    if (!CURRENT_CARD_VARIANT) {
        return;
    }
    const {count, cost, period} = CURRENT_CARD_VARIANT;
    $CLIP_CARDS_COUNT.html(declOfNum(count, ['тренировка', 'тренировки', 'тренировок']));
    $CLIP_CARDS_COST.html(`${cost} ₽`);
    $CLIP_CARDS_PERIOD.html(declOfNum(period, ['день', 'дня', 'дней']));
    $CLIP_CARDS_PER_ONE.html(Math.round(cost / count));
};

export default () => {

    CLIP_CARDS.forEach((card, index) => {
        $CLIP_CARDS_LIST.append(createCard(card, index))
    });

    const $CLIP_CARDS_RADIO = $CLIP_CARDS.find('[type="radio"]');

    $("#ClipCardsSlider").ionRangeSlider({
        values: CLIP_CARDS[0].variants.map((i) => i.count),
        grid: true,
        hide_min_max: true,
        onChange: ({from_value}) => {
            const currentVariant = CURRENT_CARD.variants.find((i) => i.count === from_value);
            CURRENT_CARD_VARIANT = currentVariant;
            setVariantParams();
        }
    });
    CURRENT_CARD = CLIP_CARDS[0];
    CURRENT_CARD_VARIANT = CURRENT_CARD.variants[0];
    setVariantParams();

    var slider = $("#ClipCardsSlider").data("ionRangeSlider");

    $CLIP_CARDS_RADIO.change(({target}) => {
        const {value} = target;
        const currentCard = CLIP_CARDS.find((i) => i.id === value);

        CURRENT_CARD = currentCard;

        slider.reset();
        slider.update({
            values: currentCard.variants.map((i) => i.count),
        });

        console.log(currentCard);
    });


}

