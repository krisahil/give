
Router.configure({
    layoutTemplate: 'MasterLayout',
    loadingTemplate: 'Loading',
    notFoundTemplate: 'NotFound',
    templateNameConverter: 'upperCamelCase',
    routeControllerNameConverter: 'upperCamelCase'
});

Router.plugin('ensureSignedIn', {
    except: ['donation.form', 'donation.landing', 'donation.thanks',
             'donation.gift', 'donation.scheduled', 'enrollAccount',
             'forgotPwd', 'resetPwd', 'stripe_webhooks', 'signIn', 'AdminSubscriptions']
});

Router.onBeforeAction(function() {
  if (!Roles.userIsInRole(Meteor.user(), ['admin', 'user-admin'])) {
    this.render("NotFound");
  } else {
    this.next();

  }
}, {only : 'Users'});

Router.onBeforeAction(function() {

  if (!Roles.userIsInRole(Meteor.user(), ['admin', 'dt-admin'])) {
    this.render("NotFound");
  } else {
    this.next();
  }
}, {only : 'admin.dashboard'});

Router.onBeforeAction(function() {

  if (!Roles.userIsInRole(Meteor.user(), ['admin', 'dt-admin', 'reports']) ) {
    this.render("NotFound");
  } else {
    this.next();
  }
}, {only : ['transfers', 'reports', 'reports.dashboard']});

Router.route('', {

    name: 'donation.form',
    path: '',
    subscriptions: function () {
        this.subscribe('Serve1000Sources2015').wait();
    },
    waitOn: function () {
      return Meteor.subscribe('Serve1000Sources2015');
    },
    action: function () {
        var params = this.params;

        if (Meteor.user()) {
            Router.go('user.give');
        }
        this.render('DonationForm');

        Session.set('params.amount', params.query.amount);
        Session.set('params.campaign', params.query.campaign);
        Session.set('params.donateTo', params.query.donateTo);
        Session.set('params.donateWith', params.query.donateWith);
        Session.set('params.dt_source', params.query.dt_source);
        Session.set('params.start_date', params.query.start_date);
        Session.set('params.note', params.query.note);
        Session.set('params.enteredWriteInValue', params.query.enteredWriteInValue);
        Session.set('params.enteredCampaignValue', params.query.enteredCampaignValue);
        Session.set('params.exp_month', params.query.exp_month);
        Session.set('params.exp_year', params.query.exp_year);
        Session.set('params.locked_amount', params.query.locked_amount);
        Session.set('params.locked_frequency', params.query.locked_frequency);
        Session.set('params.recurring', params.query.recurring);
        Session.set('params.writeIn', params.query.writeIn);
    }
});

Router.route('/landing', function () {
    var params = this.params;
    if(Meteor.user()){
        Session.set('params.give', "Yes");
        Router.go('subscriptions');
    }

    this.render('DonationLanding');
}, {
    name: 'donation.landing'
});

Router.route('/thanks', {
    name: 'donation.thanks',
    waitOn: function () {
        return  [
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

Router.route('/gift/:_id', function () {

    var params = this.params;

    this.subscribe('donate', params._id);

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

Router.route('/dashboard', function () {
    this.layout('AdminLayout');

    this.wait(Meteor.subscribe('publish_for_admin_give_form'));
    this.render('Dashboard');
}, {
    name: 'admin.dashboard'
});

Router.route('/reprotsdashboard', function () {
    this.layout('AdminLayout');

    this.render('ReportsDashboard');
}, {
    name: 'reports.dashboard'
});


Router.route('/user', function (){

  this.layout('UserLayout');

  this.wait([Meteor.subscribe('userStripeData'),
             Meteor.subscribe('userDT'),
             Meteor.subscribe('userDTFunds')]);
  if (this.ready()) {
    this.render('UserProfile');
  } else {
    this.render('Loading');
  }
}, {
  name: 'user.profile'
});

Router.route('/transfers',{
    layoutTemplate: 'UserLayout',

    action: function () {
        if (this.ready()) {
            this.render();
        } else {
            this.render('Loading');
        }
    },
    name: 'stripe.transfers'
});

Router.route('/expiring',{
    layoutTemplate: 'UserLayout',

    subscriptions: function(){
        return [
            Meteor.subscribe('subscriptions_and_customers')
        ]
    },
    action: function () {
        if (this.ready()) {
            this.render();
        } else {
            this.render('Loading');
        }
    },
    name: 'stripe.expiring'
});

Router.route('/transfers/:_id', function () {
  var params = this.params;
  var id = params._id;

  this.layout('UserLayout');

  this.wait([Meteor.subscribe('transfers', id), Meteor.subscribe('transactions', id), Meteor.subscribe('DTSources') ]);
  if (this.ready()) {
    this.render('StripeTransferDetails');
  } else {
    this.render('Loading');
  }
});

Router.route('/user/give',{
    layoutTemplate: 'UserLayout',

    subscriptions: function(){
        return [
            Meteor.subscribe('userStripeData'),
            Meteor.subscribe('userDT'),
            Meteor.subscribe('userDTFunds'),
            Meteor.subscribe('devices')
        ]
    },
    action: function () {
        if (this.ready()) {
            this.render();
        } else {
            this.render('Loading');
        }
    },
    name: 'user.give'
});

Router.route('Subscriptions', function() {
    var params = this.params;
    Session.set('fix_it', params.query.fix_it);

    this.wait(Meteor.subscribe('user_data_and_subscriptions_with_only_4'));
    if (this.ready()) {
        this.render();
    } else {
        this.render('Loading');
    }
}, {
    name: 'subscriptions',
    layoutTemplate: 'UserLayout',
    path: '/user/subscriptions'
});

Router.route('/scheduled', {
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
    var dt_status;

    if(request.data && request.data.object){
      Meteor.call("checkDonorTools", function (err, res) {
        if(res && res === true){
          dt_status = true;
        } else {
          logger.info("DT connection is down");
          dt_status = false;
        }
      });
      if(dt_status){
        // Got it, let the Stripe server go
        this.response.statusCode = 200;
        this.response.end('Oh hai Stripe!\n');

        // Process this event, but first check that it actually came from Stripe
        StripeFunctions.control_flow_of_stripe_event_processing( request );
      } else {
        console.log("No connecto to DT available");
        this.response.statusCode = 500;
        this.response.end('Sorry, no connection to DonorTools available!');
      }
    } else {
        this.response.statusCode = 400;
        this.response.end('Oh hai Stripe!\n\n');
    }
}, {
  where: 'server',
  name: 'stripe_webhooks'
});

Router.route('FixCardSubscription', {
  layoutTemplate: 'UserLayout',
  path: '/user/subscriptions/card/resubscribe',
  template: 'FixCardSubscription',
  /*waitOn: function() {
    var query = this.params.query;
    console.log( query.s );
    return [
      Meteor.subscribe( 'subscription', query.s ),
      Meteor.subscribe( 'customer', query.c )
    ]
  },
  data: function () {
    return Subscriptions.find();
  }*/
  subscriptions: function(){
    var query = this.params.query;

    return [
      Meteor.subscribe( 'subscription', query.s ),
      Meteor.subscribe( 'customer', query.c )
    ]
   },
  action: function () {
    var query = this.params.query;

    if (this.ready()) {
      Session.set('sub', query.s);
      this.render();
    } else {
      this.render('Loading');
    }
  }
});

Router.route('FixBankSubscription', {
    layoutTemplate: 'UserLayout',
    path: '/user/subscriptions/bank/resubscribe',
    template: 'FixBankSubscription',
    subscriptions: function(){
      return [
        Meteor.subscribe('subscription', this.params.query.s),
        Meteor.subscribe('customer', this.params.query.c)
      ]
    },
    action: function () {
      if (this.ready()) {
        var query = this.params.query;
        Session.set('sub', query.s);
        this.render();
      } else {
        this.render('Loading');
      }
    }
});

Router.route('/dashboard/giving_options', {
  name: 'GivingOptions',
  where: 'client',
  waitOn: function () {
    return [ Meteor.subscribe('MultiConfig'), Meteor.subscribe('userDTFunds')];
  }
});

Router.route('/dashboard/org_info', {
  name: 'OrgInfo',
  where: 'client',
  waitOn: function () {
    return Meteor.subscribe('MultiConfig');
  },
  data: function () {
    return MultiConfig.find();
  }
});

Router.route('/dashboard/getdtdata', {
  name: 'DtReport',
  where: 'client',
  waitOn: function () {
    return Meteor.subscribe( 'DTSplits' );
  },
  data: function () {
    return DT_splits.find();
  }
});

Router.route('/dashboard/subscriptions', {
  layoutTemplate: 'UserLayout',
  name: 'AdminSubscriptions',
  where: 'client',
  template: 'AdminSubscriptions',
  waitOn: function() {
    return Meteor.subscribe('subscriptions_and_customers');
  },
  data: function () {
    return Subscriptions.find();
  }
});


Router.route('/dashboard/users', {
  layoutTemplate: 'AdminLayout',
  name: 'Users',
  where: 'client',
  template: 'Users',
  waitOn: function () {
    var query = this.params.query;
    var id = query.userID;
    if(id){
      Session.set('params.userID', id);
      Session.set("showSingleUserDashboard", true);
      return [Meteor.subscribe( 'all_users', id ),
              Meteor.subscribe('roles'),
              Meteor.subscribe('userStripeData', Session.get('params.userID')),
              Meteor.subscribe('userDT', Session.get('params.userID')),
              Meteor.subscribe('userDTFunds')];
    } else if(Session.get('params.userID')) {
      Session.set("showSingleUserDashboard", true);
      return [Meteor.subscribe( 'all_users', Session.get('params.userID') ),
              Meteor.subscribe('roles'),
              Meteor.subscribe('userStripeData', Session.get('params.userID')),
              Meteor.subscribe('userDT', Session.get('params.userID')),
              Meteor.subscribe('userDTFunds')];
    } else {
      Session.set('params.userID', '');
      Session.set("showSingleUserDashboard", false);
      return [Meteor.subscribe( 'all_users' ), Meteor.subscribe('roles')];
    }
  },
  data: function () {
    var query = this.params.query;
    var id = query.userID;
    if(id){
      return Meteor.users.findOne({_id: id});
    }  else if(Session.get('params.userID')) {
      return Meteor.users.findOne({_id: Session.get('params.userID')});
    } else {
      return Meteor.users.find();
    }
  }
});
