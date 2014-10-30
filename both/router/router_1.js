Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound',
  templateNameConverter: 'upperCamelCase',
  routeControllerNameConverter: 'upperCamelCase'
});

Router.onBeforeAction(function () {
    if (Meteor.loggingIn()){
        return;
    }else if(!Meteor.user()) {
        // if the user is not logged in, render the Login template
        this.render('Login');
    } else {
        // otherwise don't hold up the rest of hooks or our route/action function from running
        this.next();
    }
    }, {
    except: ['donation.form', 'donation.thanks', 'donation.gift']
});

Router.route(':root', function () {
    var root = Meteor.settings.public.root;
    var params = this.params;
    
    Session.set('params.donateTo', params.query.donateTo);
    Session.set('params.amount', params.query.amount);
    Session.set('params.donateWith', params.query.donateWith);
    Session.set('params.recurring', params.query.recurring);
    
    this.render('DonationForm');
}, {
    name: 'donation.form'
});

Router.route(':root/thanks/:_id', function () {
    var root = Meteor.settings.public.root;
    var params = this.params;

    this.subscribe('donate', params._id).wait();

    if (this.ready()) {
        this.render('Thanks', {
            data: function () {
                return Donate.findOne(params._id);
            }
        });
    }else {
        this.render('Loading');
    }
    }, {
    name: 'donation.thanks'
});

Router.route(':root/gift/:_id', function () {
    var root = Meteor.settings.public.root;
    var params = this.params;

    this.subscribe('donate', params._id).wait();

    if (this.ready()) {
        this.render('Gift', {
            data: function () {
                Session.set('print', params.query.print);
                Session.set('transaction_guid', params.query.transaction_guid);
                return Donate.findOne(params._id);
            }
        });
    }else {
        this.render('Loading');
    }
    }, {
    name: 'donation.gift'
});

Router.route(':root/dashboard', function () {
    this.layout('AdminLayout');
    var root = Meteor.settings.public.root;

    if (this.ready()) {
        this.render('Dashboard');
    }else {
        this.render('Loading');
    }
});

Router.route(':root/transactions', function () {
    this.layout('AdminLayout');
    var root = Meteor.settings.public.root;

    this.subscribe('donate_list').wait();

    if (this.ready()) {
        this.render('Transactions');
    }else {
        this.render('Loading');
    }
});

Router.route(':root/subscription/:_id', function () {
    this.layout('AdminLayout');
    var root = Meteor.settings.public.root;

    this.subscribe('transaction', this.params._id).wait();

    if (this.ready()) {
        this.render('Subscription', {
            data: function () {
                return Donate.findOne(this.params._id);
            }
        });
    }else {
        this.render('Loading');
    }
});

Router.route(':root/tables', function () {
    this.layout('AdminLayout');
    var root = Meteor.settings.public.root;

    if (this.ready()) {
        this.render('Tables');
    }else {
        this.render('Loading');
    }
});