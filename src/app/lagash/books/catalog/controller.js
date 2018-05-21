export class LagashBooksCatalogController {

  constructor($state, $mdDialog, WError, WToast, UUID, size, BooksCatalog) {
    'ngInject';
    this.$state = $state;
    // this.Books = Books;
    this.$mdDialog = $mdDialog;
    this.UUID = UUID;
    this.WError = WError;
    this.WToast = WToast;
    this.BooksCatalog = BooksCatalog;
    // this.item = book;
    // this.ejemplar = ejemplar;

    this.items = [];
    this.total = size.total;
    this.query = {
      limit: 40,
      page: 1
    };
    var self = this;
    self.on_pagination = function() {
      BooksCatalog.pagination(self.query, function(items) {
        self.items = items;
      }).$promise;
    }
    self.on_pagination();
  }

  search_catalogs(search) {
    var self = this;
    this.query.search = search;
    this.BooksCatalog.search(self.query, function(items) {
      delete self.query['search'];
      self.items = items;
    }).$promise;
  }

  change_state(item) {
    this.BooksCatalog.update({
      _id: item._id
    }, item)
    .$promise
    .then((response) => {
      this.WToast.show('El catalogo se actualizo correctamente');
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  select_item(item) {
    this.$state.go('lagash.books.list.catalog_preview', {
      catalog_id: item._id
    });
  }

  create_catalog(title) {
    var data = {
      _id: this.UUID.next(),
      enabled: false,
      title: title || 'SIN NOMBRE'
    };
    this.BooksCatalog.save(data).$promise
    .then((res) => {
      this.items.unshift(res);
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  show_catalog_create_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: function DialogEditorialCreateController($scope, $mdDialog, item) {
        'ngInject';

        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
      },
      templateUrl: 'app/lagash/books/catalog/create.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.create_catalog(answer);
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };
}