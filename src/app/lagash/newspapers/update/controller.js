export class LagashNewspapersUpdateController {

  constructor($state, WError, $mdDialog, WToast, Newspapers, UUID, Ejemplares, newspaper, Authors, Editorials, AuthorsMap, EditorialsMap, ejemplares, NewspaperOption, ImageService, NewspapersCatalog) {
    'ngInject';
    this.newspaper_id = $state.params.newspaper_id;
    this.ImageService = ImageService;
    this.$state = $state;
    this.WError = WError;
    this.WToast = WToast;
    this.$mdDialog = $mdDialog;
    this.Newspapers = Newspapers;
    this.AuthorsMap = AuthorsMap;
    this.NewspapersCatalog = NewspapersCatalog;
    this.Editorials = Editorials;
    this.EditorialsMap = EditorialsMap;
    this.UUID = UUID;
    this.Ejemplares = Ejemplares;

    this.create_ejemplar_state = false;
    this.months = NewspaperOption.months;
    this.days = NewspaperOption.days;
    this.years = NewspaperOption.getYears();

    this.authors = [];
    this.editorial = null;
    this.catalog = null;

    this.ejemplares = ejemplares;

    newspaper.tags = newspaper.tags ? newspaper.tags.split(',') : [];
    this.item = newspaper;

    // autor
    Authors.find_authors({
      resource_id: this.newspaper_id
    }).$promise
    .then((res) => {
      this.authors = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });

    this.load_editorial();
    this.load_catalog();
  }

  load_editorial() {
    if (!this.item.editorial_id) {
       console.log('editorial_id is undefined');
       return;
    }
    this.Editorials.get({
      _id: this.item.editorial_id
    }).$promise
    .then((res) => {
      this.editorial = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  load_catalog() {
    if (!this.item.catalog_id) {
       console.log('catalog_id is undefined');
       return;
    }
    this.NewspapersCatalog.get({
      _id: this.item.catalog_id
    }).$promise
    .then((res) => {
      this.catalog = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  upload(file) {
    const self = this;
    this.ImageService.upload(file, function(res) {
      self.item.image = res.name;
    });
  }

  openMenu($mdOpenMenu, ev) {
    $mdOpenMenu(ev);
  };

  delete(item) {
    this.Newspapers.remove({
      _id: item._id
    }, item).$promise
    .then((response) => {
      this.$state.go('lagash.newspapers.list.main', {}, {reload: true});
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  update(item) {
    var data = {};
    angular.copy(item, data);
    data.tags = data.tags.join(',');
    this.Newspapers.update({
      _id: item._id
    }, data)
    .$promise
    .then((response) => {
      this.$state.go('lagash.newspapers.list.main', {}, {reload: true});
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  save_ejemplar(item) {
    item.data_id = this.newspaper_id;
    item.enabled = false;
    item.state = 'STORED';
    item.type = 'NEWSPAPER';
    this.Ejemplares.save({
      data_id: item.data_id
    }, item).$promise
    .then((response) => {
      this.create_ejemplar_state = false;
      this.WToast.show('El ejemplar se guardo correctamente');
      this.ejemplares.push(response);
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  create_ejemplar() {
    this.create_ejemplar_state = true;
    this.Ejemplares.next().$promise
    .then((res) => {
      this.ejemplar_item = {
        _id: this.UUID.next(),
        index: this.getIndex()
      };
      if (res) {
        this.ejemplar_item.inventory = res.inventory + 1;
      }
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  select_ejemplar(ejemplar) {
    this.$state.go('lagash.newspapers.list.ejemplar', {
      newspaper_id: this.newspaper_id,
      ejemplar_id: ejemplar._id
    });
  }

  getIndex() {
    let existElement = (index) => {
      let result = false;
      this.ejemplares.map((item) => {
        if (item.index === index) {
          result = true;
        }
      })
      return result;
    };
    let count = 0;
    let isTrue = true;
    while(isTrue) {
      isTrue = existElement(++count);
    }
    return count;
  }

  change_ejemplar_state(ejemplar) {
    this.Ejemplares.update({
      _id: ejemplar._id
    }, ejemplar).$promise
    .then((response) => {
      this.WToast.show('El ejemplar se actualizo correctamente');
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

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

  remove_author(item, index) {
    if (!item) {
        throw new Error('item is undefined');
    }
    this.AuthorsMap.remove({
      _id: item.map._id
    }).$promise
    .then((res) => {
      this.authors.splice(index, 1);
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  remove_editorial(item) {
    if (!item) {
        throw new Error('item is undefined');
    }
    this.editorial = null;
    this.item.editorial_id = null;
  }

  remove_catalog() {
    this.catalog = null;
    this.item.catalog_id = null;
  }

  save_author(newspaper, item) {
    this.AuthorsMap.save({
      _id: this.UUID.next(),
      author_id: item._id,
      type: 'BOOK',
      resource_id: newspaper._id
    }).$promise
    .then((res) => {
      item.map = res;
      this.authors.push(item);
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  show_catalog_search_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogCatalogSearchController2,
      templateUrl: 'app/lagash/newspapers/create/catalog/search.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.catalog = answer;
      self.item.catalog_id = answer._id;
    }, function() {
      console.info('You cancelled the dialog.');
    });
  }
}

function DialogCatalogSearchController2($scope, $mdDialog, WError, UUID, NewspapersCatalog, item) {
  'ngInject';

  $scope.zise = {
    total: 0
  };
  $scope.query = {
    limit: 25,
    page: 1
  };

  $scope.on_pagination = function() {
    NewspapersCatalog.pagination($scope.query, function(items) {
      $scope.items = items;
    }).$promise;
  }

  $scope.search_items = function(search) {
    $scope.query.search = search;
    NewspapersCatalog.search($scope.query, function(items) {
      $scope.items = items;
    }).$promise;
  }

  NewspapersCatalog.size().$promise
  .then((res) => {
    $scope.zise = res;
    $scope.on_pagination();
  })
  .catch((err) => {
    WError.request(err);
  });

  $scope.select_item = function(item) {
    if (item) {
      $mdDialog.hide(item);
    } else {
      console.log('no existe un editorial seleccionado');
    }
  }

  $scope.hide = function() {
    $mdDialog.hide();
  }

  $scope.cancel = function() {
    $mdDialog.cancel();
  }
}
