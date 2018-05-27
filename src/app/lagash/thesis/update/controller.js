export class LagashThesisUpdateController {

  constructor(
    $state,
    WError,
    $mdDialog,
    WToast,
    Thesis,
    UUID,
    Ejemplares,
    thesis,
    Tutors,
    Authors,
    Editorials,
    AuthorsMap,
    EditorialsMap,
    ejemplares,
    ThesisOption,
    ImageService,
    AutorDialogs,
    Faculties,
    Carrers,
    ThesisCatalog
  ) {
    'ngInject';
    this.thesis_id = $state.params.thesis_id;
    this.ImageService = ImageService;
    this.$state = $state;
    this.WError = WError;
    this.WToast = WToast;
    this.$mdDialog = $mdDialog;
    this.Thesis = Thesis;
    this.AuthorsMap = AuthorsMap;
    this.ThesisCatalog = ThesisCatalog;
    this.Tutors = Tutors;
    this.Faculties = Faculties;
    this.Carrers = Carrers;
    // this.Editorials = Editorials;
    // this.EditorialsMap = EditorialsMap;
    this.AutorDialogs = AutorDialogs;
    this.UUID = UUID;
    this.Ejemplares = Ejemplares;

    this.create_ejemplar_state = false;
    // this.types = ThesisOption.types;
    this.covers = ThesisOption.covers;
    this.illustrations = ThesisOption.illustrations;
    this.brings = ThesisOption.brings;
    this.years = ThesisOption.getYears();

    this.authors = [];
    // this.editorial = null;
    this.catalog = null;

    this.ejemplares = ejemplares;

    thesis.tags = thesis.tags ? thesis.tags.split(',') : [];
    thesis.illustrations = thesis.illustrations ? thesis.illustrations.split(',') : [];
    thesis.brings = thesis.brings ? thesis.brings.split(',') : [];
    this.item = thesis;

    // autor
    Authors.find_authors({
      resource_id: this.thesis_id
    }).$promise
    .then((res) => {
      this.authors = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });

    Faculties.query().$promise
    .then((res) => {
      this.faculties = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });
    Carrers.query().$promise
    .then((res) => {
      this.carrers = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });

    this.load_catalog();
    this.load_autor();
    // if (!this.item.editorial_id) {
    //    console.log('no tiene editorial');
    //    return;
    // }
    // Editorials.get({
    //   _id: this.item.editorial_id
    // }).$promise
    // .then((res) => {
    //   this.editorial = res;
    // })
    // .catch((err) => {
    //   this.WError.request(err);
    // });

    // AuthorsMap
    // EditorialsMap
  }

  load_catalog() {
    if (!this.item.catalog_id) {
       console.log('catalog_id is undefined');
       return;
    }
    this.ThesisCatalog.get({
      _id: this.item.catalog_id
    }).$promise
    .then((res) => {
      this.catalog = res;
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  load_autor() {
    if (!this.item.tutor_id) {
       console.log('tutors is undefined');
       return;
    }
    this.Tutors.get({
      _id: this.item.tutor_id
    }).$promise
    .then((res) => {
      this.tutor = res;
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
    this.Thesis.remove({
      _id: item._id
    }, item).$promise
    .then((response) => {
      this.$state.go('lagash.thesis.list.main', {}, {reload: true});
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  update(item) {
    var data = {};
    angular.copy(item, data);
    data.tags = data.tags.join(',');
    data.illustrations = data.illustrations.join(',');
    data.brings = data.brings.join(',');
    this.Thesis.update({
      _id: item._id
    }, data)
    .$promise
    .then((response) => {
      this.$state.go('lagash.thesis.list.main', {}, {reload: true});
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  save_ejemplar(item) {
    item.data_id = this.thesis_id;
    item.enabled = false;
    item.state = 'STORED';
    item.type = 'THESIS';
    this.Ejemplares.save({
      data_id: this.thesis_id
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
    this.$state.go('lagash.thesis.list.ejemplar', {
      thesis_id: this.thesis_id,
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

  save_author(thesis, item) {
    this.AuthorsMap.save({
      _id: this.UUID.next(),
      author_id: item._id,
      type: 'THESIS',
      resource_id: thesis._id
    }).$promise
    .then((res) => {
      item.map = res;
      this.authors.push(item);
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  // operations
  show_tutor_create_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogTutorsCreateController,
      templateUrl: 'app/lagash/thesis/create/tutor/create.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.tutor = answer;
      self.item.tutor_id = answer._id;
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };

  show_tutor_search_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogTutorsSearchController,
      templateUrl: 'app/lagash/thesis/create/tutor/search.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      fullscreen: false,
      locals: {
         item: null
      }
    })
    .then(function(answer) {
      self.tutor = answer;
      self.item.tutor_id = answer._id;
    }, function() {
      console.info('You cancelled the dialog.');
    });
  };

  show_author_create_dialog(ev) {
    this.AutorDialogs.show(ev, (item) => {
      this.save_author(this.item, item);
    });
  };

  show_author_search_dialog(ev) {
    this.AutorDialogs.search(ev, (item) => {
      this.save_author(this.item, item);
    });
  };

  show_catalog_search_dialog(ev) {
    var self = this;
    this.$mdDialog.show({
      controller: DialogCatalogSearchController2,
      templateUrl: 'app/lagash/thesis/create/catalog/search.html',
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

function DialogTutorsCreateController($scope, $mdDialog, WError, UUID, Country, Tutors, item) {
  'ngInject';

  $scope.item = {
    _id: UUID.next(),
    degree: 'Lic.',
    country: 'bolivia'
  };

  $scope.countries = Country.get();

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.answer = function(answer) {
    Tutors.save(answer).$promise
    .then((res) => {
      $mdDialog.hide(res);
    })
    .catch((err) => {
      WError.request(err);
    });
  };
}

function DialogTutorsSearchController($scope, $mdDialog, WError, UUID, Tutors, item) {
  'ngInject';

  $scope.query = {
    total: 100,
    limit: 25,
    page: 1
  };

  $scope.on_pagination = function() {
    Tutors.pagination($scope.query, function(items) {
      $scope.tutors = items;
    }).$promise;
  }

  $scope.search_tutor = function(search) {
    $scope.query.search = search;
    Tutors.search($scope.query, function(items) {
      $scope.tutors = items;
    }).$promise;
  };

  Tutors.size().$promise
  .then((res) => {
    $scope.query.total = res.total;
    $scope.on_pagination();
  })
  .catch((err) => {
    WError.request(err);
  });

  $scope.select_tutor = function(item) {
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

function DialogCatalogSearchController2($scope, $mdDialog, WError, UUID, ThesisCatalog, item) {
  'ngInject';

  $scope.zise = {
    total: 0
  };
  $scope.query = {
    limit: 25,
    page: 1
  };

  $scope.on_pagination = function() {
    ThesisCatalog.pagination($scope.query, function(items) {
      $scope.items = items;
    }).$promise;
  }

  $scope.search_items = function(search) {
    $scope.query.search = search;
    ThesisCatalog.search($scope.query, function(items) {
      $scope.items = items;
    }).$promise;
  }

  ThesisCatalog.size().$promise
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
