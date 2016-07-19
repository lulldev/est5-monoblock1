var directionsAnimation;

/**
 * Коллекция url адресов к endpoint/api методам связи
 * @description С сайтом и 1С
 */

var EndpointURL = "http://monoblock1.est5.ru/endpoint.php";

var EndpointAPI = {
    'url': {
        // получение полной информации о мастере (онлайн)
        'get_master_info': EndpointURL + '?method=get_master_info&master_id=',

        // уведомление устройства мастера (кабинет)
        'notificate_master_device': EndpointURL + '?method=notificate_master_device',

        // неуведомленные мастера (кабинет) // todo deploy 1C
        'get_notinformed_records': EndpointURL + '?method=get_notinformed_records',

        // уведомление мастера в 1С (кабинет) //todo deploy 1C
        'master_informed': EndpointURL + '?method=master_informed&record_id='
    }
};


var monoblockDirections = {

    // -- Направления без поднаправлений--

    // Клиника стоматологии и имплантологии
    'stomatology': ['00000005289', // 	Стоматология (взрослая)
                    '00000102309'], // Стоматология (дети + подростки + студенты)
    // Клиника косметологии и дерматологии
    'cosmetology': ['00000001020', // косметология
                    '00000000840', // еще какая то косметология
                    '00000101672'], // еще какая то косметология
    // Эстетика тела
    'bodyestethic': ['00000100943', // массаж и коррекция фигуры
                     '00000006083'], // массаж
    // Детский центр
    'kidscenter': ['00000100421', // детский центр
                    '00000102242'], // еще какой то детский центр

    // Детский центр развития и творчества
    'selfcenter': ['00000101230', // йога
                    '00000099046'], // психолог

    // -- Поднаправление Центр красоты и здоровья --
    // Парикмахерский зал
    'hairdresserd': ['00000008333', // парикмахерский зал
                     '00000003958'], // др. парикмахерский зал
    // Ногтевой сервис
    'nailservice': ['00000100266'],
    // Наращивание ресниц
    'eyelash': ['00000006829'],
    // Визаж
    'makeup': ['00000001168']
};

function animateDirections() {
    clearInterval(directionsAnimation);
    var menuItems = $('.direction-menu').find('.menu-item'), rnd,
        lastRnd = 1;

    directionsAnimation = setInterval(function () {
        $('.direction-menu').find('.zoomed').removeClass('zoomed');
        rnd = getRandomInt(0, menuItems.length, lastRnd);
        $(menuItems[rnd]).addClass('zoomed');
        lastRnd = rnd;
    }, 1200);
}

function getRandomInt(min, max, last) {
    var rnd;
    while (1) {
        rnd = Math.floor(Math.random() * (max - min + 1)) + min;
        if (rnd !== last) {
            break;
        }
    }
    return rnd;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(document).ready(function () {

    Path.map('#/').to(function () {
        $(location).attr('href', '#/directions');
    });


    Path.map("#/directions").to(function () {

        // direction in local storage
        localStorage.removeItem('direction');

        var layout = new LoadTemplate('body', 'layout',
            {
                'title': 'Вызов мастера',
                'subtitle': 'Выбери направление, на которое пришел.'
            }
        );
        layout.create(true, function () {
            var directions = new LoadTemplate('.monoblock-content', 'directions', {'directions': monoblockDirections});
            directions.create(true, function () {
                // animation init
                animateDirections();

                // add events
                $('.menu-item').on('click', function () {
                    var direction = $(this).data('direction');
                    localStorage.setItem("direction", direction);
                    $(location).attr('href', '#/masters');
                });

                $('.menu-item.beautycenter').on('click', function () {
                    $(location).attr('href', '#/beautycenter');
                });
            });
        });
    });

    Path.map("#/beautycenter").to(function () {

        // direction in local storage
        localStorage.removeItem('direction');

        var layout = new LoadTemplate('body', 'layout',
            {
                'title': 'Вызов мастера',
                'subtitle': 'Выбери направление, на которое пришел.'
            }
        );
        layout.create(true, function () {
            var subDirections = new LoadTemplate('.monoblock-content', 'beautycenter', {'directions': monoblockDirections});
            subDirections.create(true, function () {
                // animation init
                animateDirections();

                $('.menu-item').on('click', function () {
                    var direction = $(this).data('direction');
                    localStorage.setItem("direction", direction);
                    $(location).attr('href', '#/masters');
                });

                var backBtn = new LoadTemplate('.monoblock', 'backbtn', {'link': '#/directions'});
                backBtn.create();
            });
        });
    });

    Path.map("#/masters").to(function () {

        var direction = localStorage.getItem('direction');
        var layout = new LoadTemplate('body', 'layout', {'title': 'Выбери себя у мастера, к которому записан'});

        console.log('selected direction:' + direction);

        layout.create(true, function () {

            // loading template, while sending http requests
            var templateLoading = new LoadTemplate('.monoblock-content', 'loading');
            templateLoading.create(true);

            // get master struct from server
            $.get(EndpointAPI.url.get_notinformed_records, function (notInformed) {
                if ('NotInformedRecords' in notInformed) {
                    var records = notInformed.NotInformedRecords,
                        masters = [], // result arr
                        issetMaster, recordCount,
                        loadedMasterInfo = 0;// load master info

                    if (!Array.isArray(records)) {
                        records = [records];
                    }

                    recordCount = records.length;

                    records.forEach(function (record, recordCounter) {
                        $.get(EndpointAPI.url.get_master_info + record.master_id, function (masterInfo) {
                            loadedMasterInfo++;
                            masterInfo = JSON.parse(masterInfo);
                            if (masterInfo !== "404") {
                                record['master_fullname'] = masterInfo.fullname;
                                record['master_class'] = masterInfo.class;
                            }
                        });
                    });



                    // prepare data
                    var waitLoad = setInterval(function () {
                        if (loadedMasterInfo == recordCount) {
                            clearInterval(waitLoad);
                            records.forEach(function (record, recordCounter) {
                                // if selected direction
                                if ($.inArray(record.parent_group_id, monoblockDirections[direction.toString()]) != -1) {
                                    // if dublicate
                                    issetMaster = false;
                                    masters.forEach(function (storeMaster, storeMasterCounter) {
                                        if (record.master_id == storeMaster.master_id) {
                                            // master isset, add record to master
                                            masters[storeMasterCounter]['records'].push(record);
                                            issetMaster = true;
                                        } else {
                                            issetMaster = false;
                                        }
                                    });

                                    // master not isset, add master with one record
                                    if (!issetMaster) {
                                        loadedMasterInfo = true;
                                        masters.push(
                                            {
                                                'master_id': record.master_id,
                                                'master_fullname': record.master_fullname,
                                                'master_class': record.master_class,
                                                'records': [record]
                                            }
                                        );
                                    }
                                }
                            });

                            // if isset master
                            if (masters.length > 0) {
                                // template it

                                /**
                                 * Shortname master from fullname
                                 * @param fullname - fio
                                 * @return shortname - family + <br> + name
                                 * @description Helper
                                 */
                                Handlebars.registerHelper('masterFio', function (fullname) {
                                    if (fullname !== undefined && fullname.trim() !== '') {
                                        var splitFullname = fullname.split(' ');
                                        return splitFullname[0] + '<br>' + splitFullname[1];
                                    }
                                    return '';
                                });

                                /**
                                 * Shortname fio
                                 * @param fullname - fio
                                 * @return shortname - family + ' ' + name
                                 * @description Helper
                                 */
                                Handlebars.registerHelper('shortFio', function (fullname) {
                                    if (fullname !== undefined && fullname.trim() !== '') {
                                        var splitFullname = fullname.split(' '), resultShort;
                                        resultShort = splitFullname[0].capitalizeFirstLetter() + ' ' + splitFullname[1].capitalizeFirstLetter() + ' ';
                                        if (splitFullname[2] !== undefined) {
                                            resultShort += ' ' + splitFullname[2].substr(0, 1).capitalizeFirstLetter() + '.';
                                        }
                                        return resultShort;
                                    }
                                    return '';
                                });

                                var templateMasters = new LoadTemplate('.monoblock-content', 'masters', {'masters': masters});

                                templateMasters.create(true, function () {

                                    $('.client').on('click', function () {
                                        var record_id = $(this).data('record-id'),
                                            master_id = $(this).data('master-id'),
                                            client_fio = $(this).find('.client_fio').text().trim();

                                        var message_text = "Уважаемый мастер! К вам пришел клиент " + client_fio + "!";

                                        // notify device
                                        $.post(EndpointAPI.url.notificate_master_device, {
                                            'master_id': master_id,
                                            'message': message_text
                                        }, function (response_notificate_device) {
                                            if (response_notificate_device == '200') {
                                                // notify 1C
                                                $.get(EndpointAPI.url.master_informed + record_id, function (response_master_informed) {
                                                    if (response_master_informed == "1") {
                                                        $(location).attr('href', '#/complete');
                                                    } else {
                                                        alert('Ошибка при уведомлении мастера! Обратитесь к администратору!');
                                                        console.log('Ошибка при уведомлении мастера в 1С - заявка не существует')
                                                    }
                                                });

                                            } else {
                                                alert('Мастер недоступен! Обратитесь к администратору!');
                                                console.log('Ошибка при уведомлении устройства:' + response_notificate_device);
                                            }
                                        });
                                    });
                                    var backBtn = new LoadTemplate('.monoblock', 'backbtn', {'link': '#/directions'});
                                    backBtn.create();
                                    // template load complete
                                });

                            } else {
                                // no masters in direction

                                var templateMessage = new LoadTemplate('.monoblock-content', 'message',
                                    {
                                        'title': 'Нет заявок на данный момент',
                                        'description': 'Выбранное вами направление не содержит заявок!'
                                    });
                                templateMessage.create(true);

                            }

                        } // wait
                    }, 1000);

                } else {
                    var templateMessage = new LoadTemplate('.monoblock-content', 'message',
                        {
                            'title': 'Нет заявок на данный момент',
                            'description': 'Выбранное вами направление не содержит заявок!'
                        });
                    templateMessage.create(true);
                }
            });

        });
    });

    Path.map("#/complete").to(function () {
        var layout = new LoadTemplate('body', 'layout', {'title': 'Заявка выполнена!'});
        layout.create(true, function () {
            var complete = new LoadTemplate('.monoblock-content', 'complete');
            complete.create(true, function () {
                setTimeout(function () {
                    $(location).attr('href', '#/');
                }, 5000);
            });
        });
    });

    Path.root("#/");

    Path.listen();

});

