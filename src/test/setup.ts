import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";

// jsdom 28 has no HTMLDialogElement.showModal/close; focus trapping and Esc
// are checked in a real browser instead.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute("open")) {
      return;
    }
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}
