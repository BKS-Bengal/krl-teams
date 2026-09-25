(function (global) {
  "use strict";
  var observer = null;

  function kill() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function boot() {
    kill();
    var roots = document.querySelectorAll("[data-motion]");
    if (!roots.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      roots.forEach(function (root) {
        root.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      });
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    roots.forEach(function (root) {
      root.querySelectorAll(".reveal").forEach(function (el) {
        observer.observe(el);
      });
    });
  }

  global.KRLMotion = { boot: boot, kill: kill };
})(window);
