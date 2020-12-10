/*
 * **************************************************************************************
 *
 * Dateiname:                 _menu-box.js
 * Projekt:                   foe-chrome
 *
 * erstellt von:              Daniel Siekiera <daniel.siekiera@gmail.com>
 * erstellt am:	              22.12.19, 14:31 Uhr
 * zuletzt bearbeitet:       22.12.19, 13:49 Uhr
 *
 * Copyright © 2019
 *
 * **************************************************************************************
 */

let _menu_box = {

	/**
	 * Create the div holders and put them to the DOM
	 *
	 * @constructor
	 */
	BuildBoxMenu: () => {
		_menu_box.Show();
	},

	Show: () => {
        moment.locale(i18n('Local'));
        if ($('#menu_box').length === 0) {
            HTML.Box({
                id: 'menu_box',
				title: 'Menü',
				onlyTitle: true,
                dragdrop: true,
                minimize: true,
				resize: true,
				auto_close:false
			});
			_menu_box.CalcBody();
			window.dispatchEvent(new CustomEvent('foe-helper#menu_loaded'));

        } else {
            HTML.CloseOpenBox('menu_box');
        }
	},
	
	CalcBody: () => {
		_menu_box.ListLinks();
	},

	/**
	 * Bindet alle benötigten Button ein
	 *
	 */
	ListLinks: () => {
		let StorgedItems = localStorage.getItem('MenuSort');

		// Beta-Funktionen
		if (HelperBeta.active) {
			_menu.Items.unshift(...HelperBeta.menu);
		}

		if (StorgedItems !== null) {
			let storedItems = JSON.parse(StorgedItems);

			// es ist kein neues Item hinzugekommen
			if (_menu.Items.length === storedItems.length) {
				_menu.Items = JSON.parse(StorgedItems);
			}

			// ermitteln in welchem Array was fehlt...
			else {
				let missingMenu = storedItems.filter(function (sI) {
					return !_menu.Items.some(function (mI) {
						return sI === mI;
					});
				});

				let missingStored = _menu.Items.filter(function (mI) {
					return !storedItems.some(function (sI) {
						return sI === mI;
					});
				});

				_menu.Items = JSON.parse(StorgedItems);

				let items = missingMenu.concat(missingStored);

				// es gibt tatsächlich was neues...
				if (items.length > 0) {
					for (let i in items) {
						if (!items.hasOwnProperty(i)) {
							break;
						}

						// ... neues kommt vorne dran ;-)
						_menu.Items.unshift(items[i]);
					}
				}
			}
		}

		// Beta-Funktionen rausfiltern
		_menu.Items = _menu.Items.filter(e => {
			if (HelperBeta.active) return true;
			if (HelperBeta.menu.includes(e)) return false;
			return true;
		});

		// Dubletten rausfiltern
		function unique(arr) {
			return arr.filter(function (value, index, self) {
				return self.indexOf(value) === index;
			});
		}

		_menu.Items = unique(_menu.Items);

		// Menüpunkte einbinden
		for (let i in _menu.Items) {
			if (!_menu.Items.hasOwnProperty(i)) {
				break;
			}

			const name = _menu.Items[i] + '_Btn';

			// gibt es eine Funktion?
			if (_menu[name] !== undefined) {
				$('#menu_boxBody').append(_menu[name]());
			}
		}

		_menu_box.CheckButtons();
	},
	/**
	 * Tooltips etc
	 *
	 */
	CheckButtons: () => {

		let activeIdx = 0;
		$('.hud-btn').click(function () {
			activeIdx = $(this).index('.hud-btn');
		});
		// Tooltipp top ermitteln und einblenden
		$('.hud-btn').stop().hover(function(){
			let $this = $(this),
				id = $this.attr('id'),
				y = ($this.offset().top - $('[data-btn="' + id + '"]').height()-30),
				x = ($this.offset().left + 30);

			$('[data-btn="' + id + '"]').css({ left: x + 'px', top:y+"px" }).show();

		}, function(){
			let id = $(this).attr('id');

			$('[data-btn="' + id + '"]').hide();
		});

		// Sortierfunktion der Menü-items
		$('#menu_boxBody').sortable({
			placeholder: 'menu-placeholder',
			start: function () {
				$('#menu_box').addClass('is--sorting');
			},
			sort: function () {
				$('.is--sorting .hud-btn-up-active').mouseenter(function (e) {
					$('.hud-btn-up-active').stop().addClass('hasFocus');
				}).mouseleave(function () {
					$('.is--sorting .hud-btn-up-active').removeClass('hasFocus');
				});

				$('.is--sorting .hud-btn-down-active').mouseenter(function (e) {
					$('.is--sorting .hud-btn-down-active').stop().addClass('hasFocus');
				}).mouseleave(function () {
					$('.is--sorting .hud-btn-down-active').removeClass('hasFocus');
				});
			},
			stop: function () {
				_menu.Items = [];
				$('.hud-btn').each(function () {
					_menu.Items.push($(this).data('slug'));
				});
				localStorage.setItem('MenuSort', JSON.stringify(_menu.Items));

				$('#menu_box').removeClass('is--sorting');
				$.toast({
					heading: i18n('Menu.SaveMessage.Title'),
					text: i18n('Menu.SaveMessage.Desc'),
					icon: 'success',
					hideAfter: 5000
				});
			}
		});
		HiddenRewards.SetCounter();
	},
	/**
	 * Versteckt ein Button. Der HUD Slider muss dafür schon befüllt sein
	 *
	 * @param buttonId
	 * @constructor
	 */
	HideButton: (buttonId) => {
		if ($('#menu_boxBody').has(`div#${buttonId}`).length > 0)
			$($('#menu_boxBody').children(`div#${buttonId}`)[0]).hide();

	},
	/**
	 * Zeigt ein versteckten Button wieder.
	 */
	ShowButton: (buttonId) => {
		if ($('#menu_boxBody').has(`div#${buttonId}`))
			$($('#menu_boxBody').children(`div#${buttonId}`)[0]).show();
	},
};