class Can {
  constructor(
    id,
    name,
    cc,
    lang,
    sugarFree,
    creationDate = Date.now(),
    deleted = false,
    syncDate = null
  ) {
    this.id = id;
    this.name = name;
    this.cc = cc;
    this.lang = lang;
    this.sugarFree = sugarFree;
    this.creationDate = creationDate;
    this.deleted = deleted;
    this.syncDate = syncDate;
  }
}

export default Can;
