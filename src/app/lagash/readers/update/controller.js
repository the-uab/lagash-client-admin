export class LagashReadersUpdateController {

  constructor(
    $state,
    WError,
    Readers,
    UUID,
    CardType,
    Faculties,
    Carrers,
    ImageService,
    reader
  ) {
    'ngInject';
    this.reader_id = $state.params.reader_id;
    this.$state = $state;
    this.WError = WError;
    this.Readers = Readers;
    this.UUID = UUID;
    this.ImageService = ImageService;

    this.cards = CardType.get();
    this.item = reader;

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
  }

  openMenu($mdOpenMenu, ev) {
    $mdOpenMenu(ev);
  }

  upload(file) {
    const self = this;
    this.ImageService.upload(file, (res) => {
      self.item.image = res.name;
    });
  }

  delete(item) {
    this.Readers.remove({
      _id: item._id
    }, item).$promise
    .then(() => {
      this.$state.go('lagash.readers.list.main', {}, { reload: true });
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }

  update(item) {
    this.Readers.update({
      _id: item._id
    }, item)
    .$promise
    .then(() => {
      this.$state.go('lagash.readers.list.main', {}, { reload: true });
    })
    .catch((err) => {
      this.WError.request(err);
    });
  }
}
