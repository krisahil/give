/* jQueryUI combobox widget here */
$(function() {

    // the widget definition, where "joshjoe" is the namespace,
    // "combobox" the widget name

    jQuery.expr[':'].icontains = function (a, i, m) {
        return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    $.widget( "joshjoe.combobox", {
        // default options
        options: {
            buttonText: 'Go',
            isOpen: true,
            textBoxText: 'Type Here',
            showText: false,
            useIcon: false,

            // callbacks
            change: null
        },

        // the constructor
        _create: function() {

            // get the select element
            var $select = this.element;

            // hide select element
            $select.hide();

            // create the combobox
            var combobox = this._createCombboBox();
            this.combobox = $( combobox );

            // cache commonly used elements
            this._cacheElements();

            // bind UI actions
            this._bindUIActions();

            // append the created combobox to the page
            $select.after( this.combobox );

            this._refresh();

        },

        // called when created, and later when changing options
        _refresh: function() {

        },

        // events bound via _on are removed automatically
        // revert other modifications here
        _destroy: function() {
            this.combobox.remove();
            this.element.show();
        },

        _createLi: function( val, text) {
            return '\t<li data-value="' + val + '">' + '<span data-value="' + val + '">' + text + '</span>' + '</li>\n';
        },

        _createLis: function ( options ) {
            var self = this, lis = [];
            $.each( options, function ( key, option) {
                var $option = $( option ),
                    li = self._createLi( $option.val(), $option.text() );
                lis.push( li );
            });
            return lis.join('');
        },

        _createCombboBox: function () {

            var $select = this.element,
                opts = this.options,
                combobox = '';

            combobox += '<div class="combobox">\n';
            combobox += '\t<input type="text" placeholder="' + opts.textBoxText + '" class="txtbox" id="campaignDropdown">\n';

            if(opts.useIcon){
                combobox += '\t<a href="#" class="txtbox-btn">' + opts.useIcon + '</a>\n';
            } else {
                combobox += '\t<a href="#" class="txtbox-btn">' + opts.buttonText + '</a>\n';
            }

            combobox += '</div>\n';
            combobox += '<ul class="combobox-options">\n';
            combobox += '\t';

            // loop through the option elements and add them into the ul
            combobox += this._createLis( $select.children( 'option' ) );
            combobox += '</ul>\n';
            return combobox;
        },

        _openClose: function () {
            this.cached['.combobox-options'].slideToggle();
        },

        _selectLi: function ( e ) {
            var $selectedLi = $( e.target ),
                showThis,
                assignThis;
            if(this.options.showText){
                showThis = $selectedLi.text();
            } else {
                showThis = $selectedLi.data( 'value' );
            }

            assignThis = $selectedLi.data( 'value' );
            this.element.val( assignThis );

            this.cached['.txtbox'].val( showThis );
            this._openClose();

            this._trigger( 'change' );
        },

        _autocomplete: function () {
            var term = this.cached['.txtbox'].val(),
                $results = null;

            if(term !== '') {
                $results = this.cached['.combobox-options li'].find( 'span:icontains(' + term + ')' );
            } else {
                this.cached['.combobox-options'].show();
                this.cached['.combobox-options li'].show();
                this.cached['.combobox-options li'].children().show();
                return;
            }
            if ($results) {
                this.cached['.combobox-options'].show();
                this.cached['.combobox-options li'].show();
                this.cached['.combobox-options li'].children().show();

                var $spans = this.cached['.combobox-options li'].children().not( $results );
                $spans.parent().hide();
                $spans.hide();
            } else {
                this.cached['.combobox-options'].hide();
                this.cached['.combobox-options li'].show();
                this.cached['.combobox-options li'].children().show();
            }
        },

        _bindUIActions: function () {
            // initial show/hide
            this.cached['.combobox-options'].hide();
            if (this.options.isOpen) {
                this.cached['.combobox-options'].show();
            }

            // show/hide
            this._on(this.cached['.txtbox-btn'], {
                click: '_openClose'
            });

            // item select
            this._on( this.cached['.combobox-options li'], {
                click: '_selectLi'
            });

            // Autocomplete
            this._on( this.cached['.txtbox'], {
                keyup: '_autocomplete'
            })

        },

        val: function () {
            return this.element.children(":selected").val();
        },

        text: function () {
            return this.element.children(":selected").text();
        },

        // _setOptions is called with a hash of all options that are changing
        // always refresh when changing options
        _setOptions: function() {
            // _super and _superApply handle keeping the right this-context
            this._superApply( arguments );
            this._refresh();
        },

        // _setOption is called for each individual option that is changing
        _setOption: function( key, value ) {

            this._super( key, value );
        },

        _cacheElements: function () {
            var $combobox = this.combobox,
                $txtboxBtn = $combobox.find('.txtbox-btn'),
                $txtbox = $combobox.find('.txtbox'),
                $options = $combobox.siblings('.combobox-options'),
                $lis = $options.children();

            this.cached = {
                ".txtbox-btn": $txtboxBtn,
                ".combobox-options": $options,
                ".combobox-options li": $lis,
                ".txtbox": $txtbox
            };

        }
    });
});
