/*****************************************************************************/
/* Modals: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Modals.helpers({
    contact_address: function () {
        return Meteor.settings.public.contact_address;
    },
    support_address: function () {
        return Meteor.settings.public.support_address;
    },
    churchSources: function () {
        return DT_sources.find();
    },
    OTRSourceName: function () {
        var regOTR = /^OTR\s-\s2015\s-\s/;
        var nameReplaced = this.name.replace(regOTR, "")
        return nameReplaced;
    },
    sourceId: function () {
        return this.id;
    }
});

Template.Modals.events({
   /*'click .txtbox-btn': function (e) {
       e.preventDefault();
       console.log("Clicked on ");
       console.log(e.currentTarget);
       $(e.currentTarget).parent().next().slideToggle();
   },
    'click .combobox-options li': function (e) {
        e.preventDefault();
        console.log(e.currentTarget);
        console.log($(e.currentTarget).text());
        console.log($(e.currentTarget).parent().siblings('.combobox').children('.txtbox').val());
        $(e.currentTarget).parent().siblings('.combobox').children('.txtbox').val($(e.currentTarget).text());
        console.log($('#campaignDropdown').val());
        $(e.currentTarget).parent().slideToggle();
    }*/
});

Template.Modals.rendered = function() {
    $('select').select2({dropdownCssClass: 'dropdown-inverse'});

    /* jQueryUI combobox widget here */
    $(function() {

        /*

        TODO

            1. Create a combobox from a select element
            2. Sho/Hide of list
            3. Selected item funcitonality
            4. Destroy method
            5. **BONUS** Autocomplete
         */
        // the widget definition, where "custom" is the namespace,
        // "colorize" the widget name
        $.widget( "squareui.combobox", {
            // default options
            options: {
                buttonText: 'Go',
                isOpen: false,

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

            },

            _createLi: function( val, text) {
                return '\t<li data-value="' + val + '">' + '<span>' + text + '</span>' + '</li>\n';
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
                combobox += '\t<input type="text" value="Hello" class="txtbox" id="campaignDropdown">\n';
                combobox += '\t<a href="#" class="txtbox-btn">' + opts.buttonText + '</a>\n';
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

            _bindUIActions: function () {
                // initial show/hide
                this.cached['.combobox-options'].hide();
                if (this.options.isOpen) {
                    this.cached['.combobox-options'].show();
                }

                // show/hide
                this._on(this.combobox.children('.txtbox-btn'), {
                    click: '_openClose'
                });

                // item select

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
                var $combobox = this.combobx,
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

    $("#options").select2('destroy');
    $('#options').combobox();
};