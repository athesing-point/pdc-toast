//Main Toast Functionality
class Toast {
  static isVisible = false;
  static isLoading = false;

  static el = null;
  static btnEl = null;
  static messageContainer = null;
  static btnContainer = null;

  static class = {
    hidden: "toast-hidden",
    loading: "toast-loading",
    toastMessage: "toast-message",
    toastContainer: "toast-container",
    toastBtnContainer: "toast-btn-container",
  };

  static toastElementId = "toast";
  static actionButtonId = "actionBtn";

  static create(message, action = null) {
    Toast.message = message;
    Toast.init();

    Toast.setAction(action?.text, action?.callback);

    if (Toast.message || action) {
      Toast.show();
    }
  }

  static init() {
    if (Toast.el) return Toast.el;

    const el = document.createElement("div");
    el.id = Toast.toastElementId;

    const container = document.createElement("div");
    container.classList.add(Toast.class.toastContainer);
    el.append(container);

    Toast.messageContainer = document.createElement("div");
    Toast.messageContainer.classList.add(Toast.class.toastMessage);
    Toast.messageContainer.innerText = Toast.message;

    Toast.btnContainer = document.createElement("div");
    Toast.btnContainer.classList.add(Toast.class.toastBtnContainer);

    const btnEl = document.createElement("button");
    Toast.btnEl = btnEl;

    Toast.btnContainer.append(Toast.btnEl);
    container.append(Toast.messageContainer);
    container.append(Toast.btnContainer);

    Toast.el = el;
    Toast.hide();
    Toast.btnContainer.classList.add(Toast.class.hidden);
    document.body.prepend(Toast.el);
  }

  static show() {
    Toast.el.classList.remove(Toast.class.hidden);
    Toast.isVisible = true;
  }

  static hide() {
    Toast.el.classList.add(Toast.class.hidden);
    Toast.isVisible = false;
  }

  static setMessage(text) {
    Toast.message = text;
    Toast.messageContainer.innerHTML = text;
  }

  static showLoader() {
    Toast.btnEl.classList.add(Toast.class.loading);
    Toast.isLoading = true;
  }

  static hideLoader() {
    Toast.btnEl.classList.remove(Toast.class.loading);
  }

  static setAction(text, callback) {
    if (text && callback) {
      Toast.btnEl.innerHTML = text;
      Toast.btnContainer.classList.remove(Toast.class.hidden);

      Toast.btnEl.addEventListener("click", () => {
        if (Toast.isLoading) return;

        callback(null, Toast.hideLoader);
      });
    } else {
      Toast.btnContainer.classList.add(Toast.class.hidden);
    }
  }
}

class ResumeApplicationToast {
  static isVisible = false;
  static prequalDomain = null;

  constructor(prequalDomain = "https://get.point.com") {
    ResumeApplicationToast.prequalDomain = prequalDomain;
  }

  async init() {
    const data = await ResumeApplicationToast.fetchVisitorData();
    this.showToast(data);
  }

  static async fetchVisitorData() {
    try {
      const url = ResumeApplicationToast.prequalDomain + "/api/v1/visitors";
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async fetchRedirectLink() {
    const url = ResumeApplicationToast.prequalDomain + "/api/v2/estimates/resume";
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.json();
  }

  async redirectToApplication(e, endLoading) {
    function showError() {
      endLoading();
      Toast.setMessage("Sorry, looks like something went wrong." + "You can try again or contact Point at " + '&nbsp;<a href="tel:1-888-764-6823">1-888-764-6823</a>&nbsp; for further assistance.');
      Toast.setAction(null);
    }

    Toast.showLoader();

    try {
      const response = await ResumeApplicationToast.fetchRedirectLink();
      if (response.url) {
        endLoading();
        window.location.assign(response.url);
        return;
      }
    } catch (error) {
      endLoading();
      console.error(error);
    }

    endLoading();
    showError();
  }

  isVisible() {
    return ResumeApplicationToast.isVisible;
  }

  showToast(visitor) {
    if (!visitor) return;

    let actionText = null;
    let message = null;

    if (visitor.hasActiveDocket && !visitor.hasActiveApplicantFlow) {
      message = "Looks like you previously started an application";
      actionText = {
        desktop: "Check status",
        mobile: "Check status",
      };
    } else if (visitor.hasActiveDocket) {
      message = "Looks like you previously started an application";
      actionText = {
        desktop: "Resume Application",
        mobile: "Resume",
      };
    } else if (visitor.estimateKey) {
      message = "You have a recently created offer";
      actionText = {
        desktop: "View latest offer",
        mobile: "View offer",
      };
    }

    if (actionText) {
      ResumeApplicationToast.isVisible = true;

      Toast.create(message, {
        text: "<span class='desktop-text'>" + actionText.desktop + "</span><span class='mobile-text'>" + actionText.mobile + "</span>",
        callback: this.redirectToApplication,
      });
    }
  }
}

//Init Toast Functionality
(async () => {
  const prequalDomain = "https://get.point.com";
  const resumeApplicationToast = new ResumeApplicationToast();
  await resumeApplicationToast.init();
})();
