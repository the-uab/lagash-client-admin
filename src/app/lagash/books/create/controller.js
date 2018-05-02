export class LagashBooksCreateController {

  constructor($timeout, $mdDialog, $q, $state, WError, Books, UUID, AuthorMap, EditorialMap, BookOption) {
    'ngInject';
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.Books = Books;
    this.AuthorMap = AuthorMap;
    this.EditorialMap = EditorialMap;
    this.UUID = UUID;
    this.WError = WError;
    this.$q = $q;
    this.$timeout = $timeout;
    this.authors = [];
    this.editorial = null;

    this.item = {
      _id: UUID.next(),
      enabled: false,
      tags: ['otros'],
      type: null,
      cover: null,
      illustrations: ['otros'],
      length: 0,
      width: 0,
      brings: ['otros'],
      pages: 0,
      year: BookOption.get_year(),

      // fake
      title: 'lorem insum title dolor',
      isbn: 'lorem insum'
    };

    this.types = BookOption.types;
    this.covers = BookOption.covers;
    this.illustrations = BookOption.illustrations;
    this.brings = BookOption.brings;
    this.years = BookOption.getYears();

    this.searchText = null;
    this.selectedItem = null;
  }

  register(item) {
    var data = {};
    angular.copy(item, data);
    data.tags = data.tags.join(',');
    data.illustrations = data.illustrations.join(',');
    data.brings = data.brings.join(',');
    this.Books.save(data).$promise
    .then((res) => {
      this.$state.go('lagash.books.list');
      this.save_authors(res);
      // this.save_editorial(res);
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  save_authors(book) {
    this.authors.forEach((item) => {
      this.AuthorMap.save({
        _id: this.UUID.next(),
        author_id: item._id,
        type: 'book',
        resource_id: book._id
      }).$promise
      .catch((err) => {
        this.WError.request(err);
      });
    })
  }

  // save_editorial(book) {
  //     this.EditorialMap.save({
  //       _id: this.UUID.next(),
  //       editorial_id: item._id,
  //       type: 'book',
  //       resource_id: book._id
  //     }).$promise
  //     .catch((err) => {
  //       this.WError.request(err);
  //     });
  //   })
  // }

  remove_author(item, index) {
    if (!item) {
        throw new Error('item is undefined');
    }
    this.authors.splice(index, 1);
  }

  remove_editorial(item) {
    if (!item) {
        throw new Error('item is undefined');
    }
    this.editorial = null;
    this.item.editorial_id = null;
  }

  show_author_create_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogAuthorCreateController,
      templateUrl: 'app/lagash/books/create/author/create.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.authors.push(answer);
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };

  show_author_search_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogAuthorSearchController,
      templateUrl: 'app/lagash/books/create/author/search.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.authors.push(answer);
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };

  show_editorial_create_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogEditorialCreateController,
      templateUrl: 'app/lagash/books/create/editorial/create.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.editorial = answer;
      self.item.editorial_id = answer._id;
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };

  show_editorial_search_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogEditorialSearchController,
      templateUrl: 'app/lagash/books/create/editorial/search.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.editorial = answer;
      self.item.editorial_id = answer._id;
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };

  toggle(item, list) {
    var idx = list.indexOf(item.key);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(item.key);
    }
  }

  exists(item, list) {
    return list.indexOf(item.key) > -1;
  }
}

function DialogAuthorCreateController($scope, $mdDialog, WError, UUID, Country, Author, item) {
  'ngInject';

  $scope.item = {
    _id: UUID.next()
  };

  $scope.countries = Country.get();

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    Author.save(answer).$promise
    .then((res) => {
      $mdDialog.hide(res);
    })
    .catch((err) => {
      WError.request(err);
    });
  };
}

function DialogAuthorSearchController($scope, $mdDialog, WError, UUID, Author, item) {
  'ngInject';

  $scope.query = {
    total: 100,
    limit: 40,
    page: 1
  };

  $scope.on_pagination = function() {
    Author.pagination($scope.query, function(items) {
      $scope.authors = items;
    }).$promise;
  }

  $scope.search_author = function(search) {
    $scope.query.search = search;
    Author.search($scope.query, function(items) {
      $scope.authors = items;
    }).$promise;
  };

  Author.size().$promise
  .then((res) => {
    $scope.query.total = res.total;
    $scope.on_pagination();
  })
  .catch((err) => {
    WError.request(err);
  });

  $scope.select_author = function(item) {
    if (item) {
      $mdDialog.hide(item);
    } else {
      console.log('no existe un autor seleccionado');
    }
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
}

function DialogEditorialCreateController($scope, $mdDialog, WError, UUID, Country, Editorial, item) {
  'ngInject';

  $scope.item = {
    _id: UUID.next()
  };

  $scope.countries = Country.get();

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    Editorial.save(answer).$promise
    .then((res) => {
      $mdDialog.hide(res);
    })
    .catch((err) => {
      WError.request(err);
    });
  };
}

function DialogEditorialSearchController($scope, $mdDialog, WError, UUID, Editorial, item) {
  'ngInject';

  $scope.query = {
    total: 100,
    limit: 40,
    page: 1
  };

  $scope.on_pagination = function() {
    Editorial.pagination($scope.query, function(items) {
      $scope.editorials = items;
    }).$promise;
  }

  $scope.search_author = function(search) {
    $scope.query.search = search;
    Editorial.search($scope.query, function(items) {
      $scope.editorials = items;
    }).$promise;
  };

  Editorial.size().$promise
  .then((res) => {
    $scope.query.total = res.total;
    $scope.on_pagination();
  })
  .catch((err) => {
    WError.request(err);
  });

  $scope.select_editorial = function(item) {
    if (item) {
      $mdDialog.hide(item);
    } else {
      console.log('no existe un editorial seleccionado');
    }
  };

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
}
