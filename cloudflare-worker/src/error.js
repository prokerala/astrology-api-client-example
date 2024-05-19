export default class extends Error {
  constructor(title, detail, status = 400) {
    super(detail);
    this.name = 'ValidationError';
    this.status = status;
    this.title = title;
    this.detail = detail;
  }

  toJSON() {
    return {
      title: this.title,
      status: this.status,
      detail: this.detail,
    };
  }
}
