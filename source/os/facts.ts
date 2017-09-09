//Powers the 'facts' command for the OS for anyone interested in learning more about potatoes

var factList = new Array(20);
factList = [
    "Potatoes are 80% water.",
    "In 1995, the potato became the first vegetable to be grown in space.",
    "August 19th and October 27th are National Potato Day.",
    "The first french fry, which is actually just a fried potato believe it or not, consumed in the United States " +
        "was served by Thomas Jefferson at a presidential dinner.",
    "The first potato was domesticated in Peru sometime between 2000 and 3000 B.C.",
    "China is the world's largest potato producing country.",
    "The world's largest potato weighed 18 pounds and 4 ounces.",
    "Potatoes can be used to brew alcoholic beverages such as vodka, potcheen, and akvavit.",
    "Potatoes are sometimes called 'Spuds'.",
    "The Sweet Potato is actually a root vegetable and only loosely related to the Potato.",
    "The Great Famine in Ireland was caused by a potato disease known as the Potato Blight killing off a majority " +
        "of the crop.",
    "Potatoes are easy to grow, but difficult to store.",
    "Genetically modified potatoes have proven to benefits such as increased protein and resistance to viruses.",
    "Potatoes are currently grown in all 50 states of the US, as well as 124 other countries.",
    "The average American eats roughly 124 pounds of potatoes a year, while the average German eats twice as much.",
    "The word 'Potato' is derived from the Spanish word 'Batata'.",
    "The war of Bavarian Succession from 1778-1779 was known as the 'Potato War' as soldiers on both sides were " +
        "in such desperate need of food that they spent much of their time foraging for potatoes.",
    "Pringles made the world's largest potato chip, with a diameter of 23 inches.",
    "There are only three crops more important than potatoes: corn, wheat, and rice.",
    "The Aymara Indians developed over 200 varieties of potatoes before being conquered by the Incas."
];
function factGenerator(argList) {
    var num = Math.floor(Math.random() * 19);
    return argList[num];
}