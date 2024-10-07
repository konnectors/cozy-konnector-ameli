import { ContentScript } from 'cozy-clisk/dist/contentscript'
import waitFor, { TimeoutError } from 'p-wait-for'
import { blobToBase64 } from 'cozy-clisk/dist/contentscript/utils'

export default class SuperContentScript extends ContentScript {
  constructor(options = {}) {
    super(options)

    this.page = new CliskWorker(this)
    this.launcher = new CliskLauncher(this)
  }

  async runLocator(locatorJson, method, ...args) {
    const locator = CssLocator.fromJSON(this, locatorJson, ...args)
    return locator[method](...args)
  }

  async downloadFileInWorker(entry) {
    const { form, ...requestOptions } = entry.requestOptions || {}
    if (form) {
      const body = new FormData()
      for (const [key, value] of Object.entries(form)) {
        body.set(key, value)
      }
      requestOptions.body = body
    }
    const response = await fetch(entry.fileurl, requestOptions)
    entry.blob = await response.blob()
    entry.dataUri = await blobToBase64(entry.blob)
    return entry.dataUri
  }

  async workerWaitFor(fnName, fnString, options = {}, ...args) {
    const timeout = options.timeout ?? 30000
    const interval = options.interval ?? 1000
    await waitFor(() => this.evaluate(fnString, ...args), {
      interval,
      timeout: {
        milliseconds: timeout,
        message: new TimeoutError(
          options.errorMsg || fnName + ' timed out after ' + timeout + ' ms'
        )
      }
    })
    return true
  }
}

class CliskWorker {
  constructor(contentScript) {
    this.contentScript = contentScript
  }

  goto(url) {
    return this.contentScript.goto(url)
  }

  waitForElement(selector, options) {
    return this.contentScript.waitForElementInWorker(selector, options)
  }

  waitFor(fn, options = {}, ...args) {
    return this.contentScript.runInWorkerUntilTrue({
      method: 'workerWaitFor',
      args: [fn.name, fn.toString(), options, ...args]
    })
  }

  getByCss(selector, options) {
    const locator = new CssLocator(this.contentScript, selector, options)
    return locator
  }

  show() {
    return this.contentScript.setWorkerState({ visible: true })
  }

  hide() {
    return this.contentScript.setWorkerState({ visible: false })
  }

  async runLocator(locatorJson, method, ...args) {
    return this.contentScript.runInWorker(
      'runLocator',
      locatorJson,
      method,
      ...args
    )
  }

  evaluate(...args) {
    return this.contentScript.evaluateInWorker(...args)
  }

  fetch(url, options) {
    return this.contentScript.evaluateInWorker(
      async function workerFetch(url, options) {
        const { serialization, ...fetchOptions } = options
        const response = await fetch(url, fetchOptions)
        return response[serialization]()
      },
      url,
      options
    )
  }
}

class CliskLauncher {
  constructor(contentScript) {
    this.contentScript = contentScript
  }

  log(level, message) {
    this.contentScript.log(level, message)
  }
}

class CssLocator {
  constructor(contentScript, selector, options) {
    this.contentScript = contentScript
    this.selector = selector
    this.options = options
  }

  static fromJSON(contentScript, json) {
    return new this(contentScript, json.selector, json.options)
  }

  toJSON() {
    return { type: 'css', selector: this.selector, options: this.options }
  }

  _getElements() {
    return Array.from(document.querySelectorAll(this.selector))
  }

  async _isPresent() {
    const elements = this._getElements()
    return Boolean(elements.length)
  }

  async isPresent() {
    return this.contentScript.page.runLocator(this, '_isPresent')
  }

  async waitFor() {
    await this.contentScript.waitForElementInWorker(this.selector)
  }

  async _innerHTML() {
    const elements = this._getElements()
    if (elements.length > 1) {
      throw new Error(
        'Cannot get _innerHTML of multiple elements. Found ',
        elements.length
      )
    }

    return elements.pop().innerHTML
  }

  async innerHTML() {
    await this.waitFor()
    return this.contentScript.page.runLocator(this, '_innerHTML')
  }

  async _innerText() {
    const elements = this._getElements()
    if (elements.length > 1) {
      throw new Error(
        'Cannot get _innerText of multiple elements. Found ',
        elements.length
      )
    }

    return elements.pop().innerText.trim()
  }

  async innerText() {
    await this.waitFor()
    return this.contentScript.page.runLocator(this, '_innerText')
  }

  async click() {
    await this.waitFor()
    return this.contentScript.runInWorker('click', this.selector, this.options)
  }

  async fillText(text) {
    await this.waitFor()
    return this.contentScript.runInWorker('fillText', this.selector, text)
  }

  async _evaluate(fnString, ...args) {
    const elements = this._getElements()
    if (elements.length > 1) {
      throw new Error(
        'Cannot evaluate on multiple elements. Found ',
        elements.length
      )
    }
    return this.contentScript.evaluate(fnString, elements[0], ...args)
  }

  async evaluate(fn, ...args) {
    await this.waitFor()
    return this.contentScript.page.runLocator(
      this,
      '_evaluate',
      fn.toString(),
      ...args
    )
  }

  getAttribute(attr) {
    return this.evaluate(function getAttribute($el) {
      return $el.getAttribute(attr)
    })
  }
}
