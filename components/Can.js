class Can {
  constructor(
    id,
    name,
    cc,
    lang,
    sugarFree,
    creationDate = Date.now(),
    deleted = false,
    syncDate = null,
    photos = []
  ) {
    this.id = id;
    this.name = name;
    this.cc = cc;
    this.lang = lang;
    this.sugarFree = sugarFree;
    this.creationDate = creationDate;
    this.deleted = deleted;
    this.syncDate = syncDate;
    this.photos = photos.map((photo) => ({
      id: photo.id,
      uri: photo.uri,
      filename: photo.filename,
      syncDate: photo.syncDate,
      localUri: photo.localUri, // Used for local storage of downloaded images
    }));
  }

  addPhoto(photo) {
    this.photos.push({
      id: photo.id,
      uri: photo.uri,
      filename: photo.filename,
      syncDate: photo.syncDate,
      localUri: photo.localUri,
    });
    this.syncDate = null; // Mark for sync
  }

  removePhoto(photoId) {
    this.photos = this.photos.filter((p) => p.id !== photoId);
    this.syncDate = null; // Mark for sync
  }

  getPhotoUri(photoId) {
    const photo = this.photos.find((p) => p.id === photoId);
    return photo ? photo.localUri || photo.uri : null;
  }
}

export default Can;
