// ==UserScript==
// @name       7777
// @namespace  npm/vite-plugin-monkey
// @version    0.0.0
// @author     monkey
// @match      https://*.google.com/recaptcha/*
// ==/UserScript==

((o) => {
  const e = document.createElement("style");
  (e.dataset.source = "vite-plugin-monkey"),
    (e.innerText = o),
    document.head.appendChild(e);
})(
  "body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;display:flex}code{font-family:source-code-pro,Menlo,Monaco,Consolas,Courier New,monospace}"
);

(function () {
  "use strict";
  const sharedConfig = {};
  function setHydrateContext(context) {
    sharedConfig.context = context;
  }
  const equalFn = (a, b) => a === b;
  const signalOptions = {
    equals: equalFn,
  };
  let runEffects = runQueue;
  const STALE = 1;
  const PENDING = 2;
  const UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null,
  };
  var Owner = null;
  let Transition = null;
  let Listener = null;
  let Updates = null;
  let Effects = null;
  let ExecCount = 0;
  function createRoot(fn, detachedOwner) {
    const listener = Listener,
      owner = Owner,
      unowned = fn.length === 0,
      root = unowned
        ? UNOWNED
        : {
            owned: null,
            cleanups: null,
            context: null,
            owner: detachedOwner || owner,
          },
      updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
    Owner = root;
    Listener = null;
    try {
      return runUpdates(updateFn, true);
    } finally {
      Listener = listener;
      Owner = owner;
    }
  }
  function createSignal(value, options) {
    options = options
      ? Object.assign({}, signalOptions, options)
      : signalOptions;
    const s = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0,
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        value2 = value2(s.value);
      }
      return writeSignal(s, value2);
    };
    return [readSignal.bind(s), setter];
  }
  function createRenderEffect(fn, value, options) {
    const c = createComputation(fn, value, false, STALE);
    updateComputation(c);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c = createComputation(fn, value, false, STALE),
      s = SuspenseContext && lookup(Owner, SuspenseContext.id);
    if (s) c.suspense = s;
    c.user = true;
    Effects ? Effects.push(c) : updateComputation(c);
  }
  function untrack(fn) {
    const listener = Listener;
    Listener = null;
    try {
      return fn();
    } finally {
      Listener = listener;
    }
  }
  let SuspenseContext;
  function readSignal() {
    const runningTransition = Transition;
    if (this.sources && (this.state || runningTransition)) {
      if (this.state === STALE || runningTransition) updateComputation(this);
      else {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(this), false);
        Updates = updates;
      }
    }
    if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        this.observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    let current = node.value;
    if (!node.comparator || !node.comparator(current, value)) {
      node.value = value;
      if (node.observers && node.observers.length) {
        runUpdates(() => {
          for (let i = 0; i < node.observers.length; i += 1) {
            const o = node.observers[i];
            const TransitionRunning = Transition && Transition.running;
            if (TransitionRunning && Transition.disposed.has(o));
            if (
              (TransitionRunning && !o.tState) ||
              (!TransitionRunning && !o.state)
            ) {
              if (o.pure) Updates.push(o);
              else Effects.push(o);
              if (o.observers) markDownstream(o);
            }
            if (TransitionRunning);
            else o.state = STALE;
          }
          if (Updates.length > 1e6) {
            Updates = [];
            if (false);
            throw new Error();
          }
        }, false);
      }
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn) return;
    cleanNode(node);
    const owner = Owner,
      listener = Listener,
      time = ExecCount;
    Listener = Owner = node;
    runComputation(node, node.value, time);
    Listener = listener;
    Owner = owner;
  }
  function runComputation(node, value, time) {
    let nextValue;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      if (node.pure) {
        {
          node.state = STALE;
          node.owned && node.owned.forEach(cleanNode);
          node.owned = null;
        }
      }
      handleError(err);
    }
    if (!node.updatedAt || node.updatedAt <= time) {
      if (node.updatedAt != null && "observers" in node) {
        writeSignal(node, nextValue);
      } else node.value = nextValue;
      node.updatedAt = time;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: null,
      pure,
    };
    if (Owner === null);
    else if (Owner !== UNOWNED) {
      {
        if (!Owner.owned) Owner.owned = [c];
        else Owner.owned.push(c);
      }
    }
    return c;
  }
  function runTop(node) {
    const runningTransition = Transition;
    if (node.state === 0 || runningTransition) return;
    if (node.state === PENDING || runningTransition) return lookUpstream(node);
    if (node.suspense && untrack(node.suspense.inFallback))
      return node.suspense.effects.push(node);
    const ancestors = [node];
    while (
      (node = node.owner) &&
      (!node.updatedAt || node.updatedAt < ExecCount)
    ) {
      if (node.state || runningTransition) ancestors.push(node);
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
      node = ancestors[i];
      if (node.state === STALE || runningTransition) {
        updateComputation(node);
      } else if (node.state === PENDING || runningTransition) {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(node, ancestors[0]), false);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates) return fn();
    let wait = false;
    if (!init) Updates = [];
    if (Effects) wait = true;
    else Effects = [];
    ExecCount++;
    try {
      const res = fn();
      completeUpdates(wait);
      return res;
    } catch (err) {
      if (!Updates) Effects = null;
      handleError(err);
    }
  }
  function completeUpdates(wait) {
    if (Updates) {
      runQueue(Updates);
      Updates = null;
    }
    if (wait) return;
    const e = Effects;
    Effects = null;
    if (e.length) runUpdates(() => runEffects(e), false);
  }
  function runQueue(queue) {
    for (let i = 0; i < queue.length; i++) runTop(queue[i]);
  }
  function runUserEffects(queue) {
    let i,
      userLength = 0;
    for (i = 0; i < queue.length; i++) {
      const e = queue[i];
      if (!e.user) runTop(e);
      else queue[userLength++] = e;
    }
    if (sharedConfig.context) setHydrateContext();
    for (i = 0; i < userLength; i++) runTop(queue[i]);
  }
  function lookUpstream(node, ignore) {
    const runningTransition = Transition;
    node.state = 0;
    for (let i = 0; i < node.sources.length; i += 1) {
      const source = node.sources[i];
      if (source.sources) {
        if (source.state === STALE || runningTransition) {
          if (source !== ignore) runTop(source);
        } else if (source.state === PENDING || runningTransition)
          lookUpstream(source, ignore);
      }
    }
  }
  function markDownstream(node) {
    const runningTransition = Transition;
    for (let i = 0; i < node.observers.length; i += 1) {
      const o = node.observers[i];
      if (!o.state || runningTransition) {
        o.state = PENDING;
        if (o.pure) Updates.push(o);
        else Effects.push(o);
        o.observers && markDownstream(o);
      }
    }
  }
  function cleanNode(node) {
    let i;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(),
          index2 = node.sourceSlots.pop(),
          obs = source.observers;
        if (obs && obs.length) {
          const n = obs.pop(),
            s = source.observerSlots.pop();
          if (index2 < obs.length) {
            n.sourceSlots[s] = index2;
            obs[index2] = n;
            source.observerSlots[index2] = s;
          }
        }
      }
    }
    if (node.owned) {
      for (i = 0; i < node.owned.length; i++) cleanNode(node.owned[i]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i = 0; i < node.cleanups.length; i++) node.cleanups[i]();
      node.cleanups = null;
    }
    node.state = 0;
    node.context = null;
  }
  function castError(err) {
    if (err instanceof Error || typeof err === "string") return err;
    return new Error("Unknown error");
  }
  function handleError(err) {
    err = castError(err);
    throw err;
  }
  function lookup(owner, key) {
    return owner
      ? owner.context && owner.context[key] !== void 0
        ? owner.context[key]
        : lookup(owner.owner, key)
      : void 0;
  }
  function createComponent(Comp, props) {
    return untrack(() => Comp(props || {}));
  }
  function reconcileArrays(parentNode, a, b) {
    let bLength = b.length,
      aEnd = a.length,
      bEnd = bLength,
      aStart = 0,
      bStart = 0,
      after = a[aEnd - 1].nextSibling,
      map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node =
          bEnd < bLength
            ? bStart
              ? b[bStart - 1].nextSibling
              : b[bEnd - bStart]
            : after;
        while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a[aStart])) a[aStart].remove();
          aStart++;
        }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node = a[--aEnd].nextSibling;
        parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
        parentNode.insertBefore(b[--bEnd], node);
        a[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = /* @__PURE__ */ new Map();
          let i = bStart;
          while (i < bEnd) map.set(b[i], i++);
        }
        const index2 = map.get(a[aStart]);
        if (index2 != null) {
          if (bStart < index2 && index2 < bEnd) {
            let i = aStart,
              sequence = 1,
              t;
            while (++i < aEnd && i < bEnd) {
              if ((t = map.get(a[i])) == null || t !== index2 + sequence) break;
              sequence++;
            }
            if (sequence > index2 - bStart) {
              const node = a[aStart];
              while (bStart < index2)
                parentNode.insertBefore(b[bStart++], node);
            } else parentNode.replaceChild(b[bStart++], a[aStart++]);
          } else aStart++;
        } else a[aStart++].remove();
      }
    }
  }
  function render(code, element, init, options = {}) {
    let disposer;
    createRoot((dispose) => {
      disposer = dispose;
      element === document
        ? code()
        : insert(element, code(), element.firstChild ? null : void 0, init);
    }, options.owner);
    return () => {
      disposer();
      element.textContent = "";
    };
  }
  function insert(parent, accessor, marker, initial) {
    if (marker !== void 0 && !initial) initial = [];
    if (typeof accessor !== "function")
      return insertExpression(parent, accessor, initial, marker);
    createRenderEffect(
      (current) => insertExpression(parent, accessor(), current, marker),
      initial
    );
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    if (sharedConfig.context && !current) current = [...parent.childNodes];
    while (typeof current === "function") current = current();
    if (value === current) return current;
    const t = typeof value,
      multi = marker !== void 0;
    parent = (multi && current[0] && current[0].parentNode) || parent;
    if (t === "string" || t === "number") {
      if (sharedConfig.context) return current;
      if (t === "number") value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && node.nodeType === 3) {
          node.data = value;
        } else node = document.createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          current = parent.firstChild.data = value;
        } else current = parent.textContent = value;
      }
    } else if (value == null || t === "boolean") {
      if (sharedConfig.context) return current;
      current = cleanChildren(parent, current, marker);
    } else if (t === "function") {
      createRenderEffect(() => {
        let v = value();
        while (typeof v === "function") v = v();
        current = insertExpression(parent, v, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      const currentArray = current && Array.isArray(current);
      if (normalizeIncomingArray(array, value, current, unwrapArray)) {
        createRenderEffect(
          () =>
            (current = insertExpression(parent, array, current, marker, true))
        );
        return () => current;
      }
      if (sharedConfig.context) {
        if (!array.length) return current;
        for (let i = 0; i < array.length; i++) {
          if (array[i].parentNode) return (current = array);
        }
      }
      if (array.length === 0) {
        current = cleanChildren(parent, current, marker);
        if (multi) return current;
      } else if (currentArray) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else reconcileArrays(parent, current, array);
      } else {
        current && cleanChildren(parent);
        appendNodes(parent, array);
      }
      current = array;
    } else if (value instanceof Node) {
      if (sharedConfig.context && value.parentNode)
        return (current = multi ? [value] : value);
      if (Array.isArray(current)) {
        if (multi)
          return (current = cleanChildren(parent, current, marker, value));
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !parent.firstChild) {
        parent.appendChild(value);
      } else parent.replaceChild(value, parent.firstChild);
      current = value;
    } else;
    return current;
  }
  function normalizeIncomingArray(normalized, array, current, unwrap) {
    let dynamic = false;
    for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i],
        prev = current && current[i];
      if (item instanceof Node) {
        normalized.push(item);
      } else if (item == null || item === true || item === false);
      else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (typeof item === "function") {
        if (unwrap) {
          while (typeof item === "function") item = item();
          dynamic =
            normalizeIncomingArray(
              normalized,
              Array.isArray(item) ? item : [item],
              Array.isArray(prev) ? prev : [prev]
            ) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else {
        const value = String(item);
        if (prev && prev.nodeType === 3 && prev.data === value) {
          normalized.push(prev);
        } else normalized.push(document.createTextNode(value));
      }
    }
    return dynamic;
  }
  function appendNodes(parent, array, marker = null) {
    for (let i = 0, len = array.length; i < len; i++)
      parent.insertBefore(array[i], marker);
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === void 0) return (parent.textContent = "");
    const node = replacement || document.createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i = current.length - 1; i >= 0; i--) {
        const el = current[i];
        if (node !== el) {
          const isParent = el.parentNode === parent;
          if (!inserted && !i)
            isParent
              ? parent.replaceChild(node, el)
              : parent.insertBefore(node, marker);
          else isParent && el.remove();
        } else inserted = true;
      }
    } else parent.insertBefore(node, marker);
    return [node];
  }
  const index = "";
  const [count, setCount] = createSignal(0);
  const [ChildCount, setChildCount] = createSignal();
  const $ = (val) => document.querySelector(val);
  const $all = (val) => document.querySelectorAll(val);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  createEffect(() => {
    console.log("count", count());
    let tiles = $all("table tbody tr td");
    console.log(tiles == null ? void 0 : tiles.length);
    setCount(tiles == null ? void 0 : tiles.length);
  });
  function App() {
    let solve = "https://beta.nocaptchaai.com/solve";
    const headers = {
      "Content-Type": "application/json",
      apikey: "",
    };
    function isSolved() {
      var _a, _b;
      const is_widget_frame_solved =
        ((_a = document.querySelector(".recaptcha-checkbox")) == null
          ? void 0
          : _a.getAttribute("aria-checked")) === "true";
      const is_image_frame_solved =
        (_b = document.querySelector("#recaptcha-verify-button")) == null
          ? void 0
          : _b.disabled;
      return is_widget_frame_solved || is_image_frame_solved;
    }
    async function getBase64FromUrl(url) {
      const blob = await (await fetch(url)).blob();
      return new Promise(function (resolve) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.addEventListener("loadend", function () {
          resolve(reader.result.replace(/^data:image\/(png|jpeg);base64,/, ""));
        });
      });
    }
    (async () => {
      var _a;
      console.log("this ran");
      let tiles = $all("table tbody tr td");
      console.log(tiles == null ? void 0 : tiles.length);
      setCount(tiles == null ? void 0 : tiles.length);
      if ((tiles == null ? void 0 : tiles.length) > 0) {
        if (count() === 16) {
          console.log("16 ran");
          await solve44();
        } else if (count() === 9) {
          console.log("9 ran");
          await solve33();
        }
      }
      (_a = $(".recaptcha-checkbox-border")) == null ? void 0 : _a.click();
      await sleep(2e3);
      async function solve44() {
        var _a2, _b;
        console.log("44 ran");
        if (isSolved()) return;
        if (count() === 9) {
          console.log("moving to 33");
          solve33();
          return;
        }
        function target2() {
          return $(
            ".rc-imageselect-desc strong,.rc-imageselect-desc-no-canonical strong"
          );
        }
        let images = {
          0: await getBase64FromUrl(
            (_a2 = $(".rc-image-tile-44")) == null ? void 0 : _a2.src
          ),
        };
        const response = await fetch(solve, {
          method: "POST",
          headers,
          body: JSON.stringify({
            images,
            target: target2().innerText,
            type: 44,
            method: "recaptcha2",
          }),
        });
        const result = await response.json();
        console.log(await result.solution);
        if ((await result.status) === "solved") {
          console.log("44 received solved");
          for (const index2 of result.solution) {
            $all(".rc-imageselect-tile")[index2].click();
            await sleep(1e3);
            images = {};
          }
          (_b = $("#recaptcha-verify-button")) == null ? void 0 : _b.click();
          await sleep(1e3);
          if (count() === 16) {
            solve44();
          } else if (count() === 9) {
            solve33();
          }
        }
      }
      async function solve33(a) {
        var _a2, _b;
        console.log("33 ran");
        if (isSolved()) return;
        if (count() === 16) {
          console.log("44");
          solve44();
          return;
        }
        function target2() {
          return $(
            ".rc-imageselect-desc strong,.rc-imageselect-desc-no-canonical strong"
          );
        }
        let images = {};
        if (a) {
          const aa = $all(".rc-image-tile-wrapper");
          for (const index2 of a) {
            images[index2] = await getBase64FromUrl(aa[index2].children[0].src);
            await sleep(1e3);
          }
        } else {
          images[0] = await getBase64FromUrl(
            (_a2 = $(".rc-image-tile-33")) == null ? void 0 : _a2.src
          );
        }
        const response = await fetch(solve, {
          method: "POST",
          headers,
          body: JSON.stringify({
            images,
            target: target2().innerText,
            type: a ? "split_33" : 33,
            method: "recaptcha2",
          }),
        });
        const result = await response.json();
        console.log(result.solution);
        if (result.status === "solved") {
          if (result.solution.length == 0) {
            $("#recaptcha-verify-button").click();
            await sleep(1e3);
            if (count() === 16) {
              solve44();
            } else if (count() === 9) {
              solve33();
            }
          } else {
            for (const index2 of result.solution) {
              $all(".rc-imageselect-tile")[index2].style.transition = "";
              $all(".rc-imageselect-tile")[index2].click();
              await sleep(1e3);
            }
            if ($(".rc-image-tile-11") === null) {
              let checkDisplay = function (parent2) {
                let children = parent2.children;
                for (let i = 0; i < children.length; i++) {
                  if (children[i].style.display === "none") {
                    return true;
                  }
                }
                return false;
              };
              $("#recaptcha-verify-button").click();
              let parent = document.querySelector("[aria-live='polite']");
              if (checkDisplay(parent)) {
                console.log("skipping");
                $("#recaptcha-reload-button").click();
                await sleep(2e3);
                if (count() === 16) {
                  solve44();
                } else if (count() === 9) {
                  solve33();
                }
              }
            } else {
              await sleep(1e3);
              solve33(result.solution);
            }
          }
          document.querySelectorAll(".rc-image-tile-overlay");
          setChildCount($all(".rc-image-tile-overlay").length);
          await sleep(2e3);
        } else if (result.solution === 0) {
          (_b = $("#recaptcha-verify-button")) == null ? void 0 : _b.click();
        }
      }
    })();
  }
  render(
    () => createComponent(App, {}),
    (() => {
      const app = document.createElement("div");
      app.style.flex = "1";
      document.body.append(app);
      return app;
    })()
  );
})();