var root_path = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.root) || "";
Router.configure({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'Loading',
    notFoundTemplate: 'NotFound',
    templateNameConverter: 'upperCamelCase',
    routeControllerNameConverter: 'upperCamelCase'
});

Router.onBeforeAction(function () {
    if(!Meteor.user()) {
        // if the user is not logged in, render the Login template
        this.render('Login');
    } else {
        // otherwise don't hold up the rest of hooks or our route/action function from running
        this.next();
    }
}, {
    except: ['donation.form', 'donation.thanks', 'donation.gift', 'donation.scheduled', 'enrollAccount', 'forgotPwd', 'resetPwd', 'stripe_webhooks']
});

Router.route(':root_path', function () {

    var params = this.params;
    if(Meteor.user()){
        Session.set('params.give', "Yes");
        Router.go('subscriptions');
    }

    Session.set('params.donateTo', params.query.donateTo);
    Session.set('params.amount', params.query.amount);
    Session.set('params.donateWith', params.query.donateWith);
    Session.set('params.recurring', params.query.recurring);
    Session.set('params.exp_month', params.query.exp_month);
    Session.set('params.exp_year', params.query.exp_year);
    Session.set('params.writeIn', params.query.writeIn);
    Session.set('params.enteredWriteInValue', params.query.enteredWriteInValue);

    this.render('DonationForm');
}, {
    name: 'donation.form'
});

Router.route(root_path + '/thanks', {
    name: 'donation.thanks',
    waitOn: function () {
        return  [
            Meteor.subscribe('receipt_donations', this.params.query.don),
            Meteor.subscribe('receipt_customers', this.params.query.c),
            Meteor.subscribe('receipt_charges', this.params.query.charge)
        ];
    },
    data: function () {

    },
    action: function () {
        this.render('Thanks', {
            data: function () {
                Session.set('print', this.params.query.print);
            }
        });
    }
});

Router.route(root_path + '/gift/:_id', function () {

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
        this.next();
    }else {
        this.render('Loading');
        this.next();
    }
}, {
    name: 'donation.gift'
});

Router.route(root_path + '/dashboard', function () {
    this.layout('AdminLayout');

    this.render('Dashboard');
}, {
    name: 'admin.dashboard'
});

Router.route(root_path + '/transactions', function () {
    this.layout('AdminLayout');


    this.subscribe('donate_list').wait();

    if (this.ready()) {
        this.render('Transactions');
        this.next();
    }else {
        this.render('Loading');
        this.next();
    }
});

Router.route(root_path + '/subscription/:_id', function () {
    this.layout('AdminLayout');


    this.subscribe('donate', this.params._id).wait();

    if (this.ready()) {
        this.render('Subscription', {
            data: function () {
                return Donate.findOne(this.params._id);
            }
        });
        this.next();
    }else {
        this.render('Loading');
        this.next();
    }
});

Router.route(root_path + '/order/:_id', function () {
    this.layout('AdminLayout');


    this.subscribe('donate', this.params._id).wait();

    if (this.ready()) {
        this.render('Order', {
            data: function () {
                return Donate.findOne(this.params._id);
            }
        });
        this.next();
    }else {
        this.render('Loading');
        this.next();
    }
});

Router.route(root_path + '/tables', {
    template: 'Tables',
    name: 'admin.tables',
    layoutTemplate: 'AdminLayout',
    action: function () {
        this.render('Tables')
    }
});

Router.route(root_path + '/report', {
    name: 'admin.report',
    template: 'Report',
    layoutTemplate: 'AdminLayout',

    waitOn: function () {
        var query = this.params.query;
        Session.set('startDate', query.startDate);
        Session.set('endDate', query.endDate);
        return Meteor.subscribe('give_report', query.startDate, query.endDate);
    }
});

Router.route(root_path + '/expiring', {
    name: 'admin.expiring',
    template: 'Expiring',
    layoutTemplate: 'AdminLayout',

    waitOn: function () {
        return Meteor.subscribe('card_expiring');
    }
});

Router.route(root_path + '/user',{
    layoutTemplate: 'UserLayout',

    subscriptions: function(){
        return [
            Meteor.subscribe('userStripeData'),
            Meteor.subscribe('userDT'),
            Meteor.subscribe('userDTFunds')
        ]
    },
    action: function () {
        if (this.ready()) {
            this.render();
        } else {
            this.render('Loading');
        }
    },
    name: 'user.profile'
});

Router.route('subscriptions', {
        layoutTemplate: 'UserLayout',
        path: root_path + '/user/subscriptions',
        subscriptions: function() {
            return Meteor.subscribe('userStripeDataWithSubscriptions');
        },
        action: function () {
            if (this.ready()) {
                this.render();
            } else {
                this.render('Loading');
            }
        }
    }
);

Router.route('PaymentDevice', {
        layoutTemplate: 'UserLayout',
        path: root_path + '/user/paymentDevice',
        subscriptions: function() {
            return Meteor.subscribe('userStripeDataWithSubscriptions');
        },
        action: function () {
            if (this.ready()) {
                this.render();
            } else {
                this.render('Loading');
            }
        }
    }
);

Router.route(root_path + '/scheduled', {
    name: 'donation.scheduled',

    data: function () {
        Session.set('params.frequency', this.params.query.frequency);
        Session.set('params.amount', this.params.query.amount);
        Session.set('params.start_date', moment(this.params.query.start_date * 1000).format('DD MMM, YYYY'));
    }
});

Router.route('/webhooks/stripe', function () {

    // Receive an event, check that it contains a data.object object and send along to appropriate function
    var request = this.request.body;
    if(request.data && request.data.object){
        console.dir(request.data.object);
        var event = Stripe_Events[request.type](request);
        this.response.statusCode = 200;
        this.response.end('Oh hai Stripe!\n');
    } else {
        this.response.statusCode = 400;
        this.response.end('Oh hai Stripe!\n\n');
    }
}, {where: 'server',
    name: 'stripe_webhooks'
});