const acc = [];
async function getTest(geocode, product) {
    const response = await fetch("https://geocode-maps.yandex.ru/1.x/?format=json&apikey=2ca7f88e-79a8-4b7f-bd55-b47b2bf5f3fd&geocode=geocode" + geocode + '"', {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const points = await response.json();
    array = points.response.GeoObjectCollection.featureMember;

    array.forEach(item => {
        const pos = item.GeoObject.Point.pos;
        const posString = pos;
        const splitsPosition = posString.split(' ', 3);

        function swap(arr, a, b) {
            arr[a] = arr.splice(b, 1, arr[a])[0];
        }
        console.log(swap(splitsPosition, 0, 1));

        acc.unshift({
            ['address']: splitsPosition,
            ['product']: product
        });
    });
    return acc;
}

const formElement = document.getElementById('form');
const buttonElement = document.getElementById('button');
buttonElement.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(document.getElementById('textarea').value);
    const arStr = [];
    arStr.push(document.getElementById('textarea').value);
    const result = document.getElementById('textarea').value.split('\n');
    const products = ["эспоо", "симпл", "вааса"];

    var resultText = result.map(str => str.split(",").reduce(
        (acc, item) => {
            if (products.filter(product => item.toLowerCase().includes(product)).length > 0 || acc.product != "") {
                acc.product += (acc.product != "" ? "," : "") + item;
            } else {
                acc.address += (acc.address != "" ? "," : "") + item;
            }
            return acc;
        }

        , {
            address: "",
            product: ""
        }));

    var accPromise = [];
    resultText.forEach((item) => {
        const geocode = 'Россия, Москва,' + item.address + "'";
        const product = item.product;
        console.log(getTest(geocode, product));
        accPromise = getTest(geocode, product);

    });

    function init() {
        var myMap = new ymaps.Map("map", {
            center: [55.852713, 37.682727],
            zoom: 5
        }, {
            searchControlProvider: 'yandex#search'
        });

        var myCollection = new ymaps.GeoObjectCollection();
        //здесь перебираю координаты
        accPromise.then((value) => {
            value.forEach((element) => {

                var myPlacemark = new ymaps.Placemark(
                    element.address,

                    {
                        balloonContentHeader: 'Товар:',
                        balloonContent: element.product
                    }, {
                        preset: 'islands#icon',
                        iconColor: '#0000ff'
                    });
                myCollection.add(myPlacemark);
            });
        });
        myMap.geoObjects.add(myCollection);
        myMap.setBounds(myCollection.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 9
        });
    }
    ymaps.ready(init);

});