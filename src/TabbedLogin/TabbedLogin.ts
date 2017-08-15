import * as dojoDeclare from "dojo/_base/declare";
import * as domConstruct from "dojo/dom-construct";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import * as dom from "dojo/dom";
import * as dojoHas from "dojo/has";
import "../ui/TabbedLogin.css";

class TabbedLogin extends WidgetBase {
    // Parameters configured in modeler
    personLogin: string;
    userName: string;
    password: string;
    email: string;
    signupMicroflow: string;
    forgetPasswordMicroflow: string;
    userExample: string;
    passwordExample: string;
    emailExample: string;
    showLabels: false;
    emailLabel: string;
    userNameLabel: string;
    emptyText: string;
    passwordLabel: string;
    loginText: string;
    signupText: string;
    resetPasswordtext: string;
    loginTab: string;
    signupTab: string;
    forgotTab: string;
    showprogress: false;
    clearPassword: false;
    clearUserName: false;
    dofocus: boolean;
    showLoginFailureWarning: false;
    loginFailureText: string;
    autoComplete: false;
    autoCorrect: false;
    convertCase: string;
    autoCapitalize: false;
    keyboardType: string;
    showForgotTab: boolean;
    showSignupTab: boolean;

    // Internal variables
    private contextObject: mendix.lib.MxObject;
    private indicator: number;
    private loginForm_FailedAttempts: number;
    private message: string;
    private isUnMask: boolean;

    postCreate() {
        this.isUnMask = false;
        this.loginForm_FailedAttempts = 0;
        this.message = "The username or password you entered is incorrect.";
    }

    update(object: mendix.lib.MxObject, callback?: () => void) {
        this.contextObject = object;
        this.updateRendering();

        if (callback) {
            callback();
        }
    }

    private clearErrorOnFocus(inputId: string, errorNode: string) {
        dom.byId(inputId).addEventListener("focus", () => {
            dom.byId(inputId).setAttribute("style", "border: 1px solid #008CBA;");
            dom.byId(errorNode).setAttribute("style", "display:none;");
        }, false);
    }

    private clearErrorOnBlur(inputId: string, errorNode: string) {
           dom.byId(inputId).setAttribute("style", "border: none; border-bottom: 1px solid #008CBA;");
           dom.byId(errorNode).setAttribute("style", "display:none;");
    }

    private displayText() {
        const HtmlTemplate = require("../Template/TabbedLogin.html");

        domConstruct.place(domConstruct.toDom(HtmlTemplate), this.domNode);
        dom.byId("loginUserName").setAttribute("placeholder", this.userExample);
        dom.byId("registerUserName").setAttribute("placeholder", this.userExample);
        dom.byId("loginPassword").setAttribute("placeholder", this.passwordExample);
        dom.byId("registerPassword1").setAttribute("placeholder", this.passwordExample);
        dom.byId("registerPassword2").setAttribute("placeholder", this.passwordExample);
        dom.byId("forgotPasswordEmail").setAttribute("placeholder", this.emailExample);
        dom.byId("registerEmail").setAttribute("placeholder", this.emailExample);

        dom.byId("loginButton").setAttribute("value", this.loginText);
        dom.byId("signup").setAttribute("value", this.signupText);
        dom.byId("resetPassword").setAttribute("value", this.resetPasswordtext);
    }
    private updateRendering() {
        if (this.showForgotTab && this.forgetPasswordMicroflow === "") {
            domConstruct.create("div", {
                innerHTML: "Forgot password microflow has not been configured",
                style: "color:red; display: block;"
            }, this.domNode);
        } else if (this.showSignupTab && this.signupMicroflow === "") {
            domConstruct.create("div", {
                innerHTML: "sign up microflow has not been configured",
                style: "color:red; display: block;"
            }, this.domNode);
        } else {
            this.displayText();
            this.displayLabels();
            this.displayTabs();
            if (this.dofocus === true) {
                this.focusUserName();
            }
            this.clearErrorOnFocus("loginUserName", "loginUserNameError");
            this.clearErrorOnFocus("loginPassword", "userPasswordError");
            this.clearErrorOnFocus("registerUserName", "registerUserNameError");
            this.clearErrorOnFocus("registerPassword1", "registerPassword1Error");
            this.clearErrorOnFocus("registerPassword2", "registerPassword2Error");
            this.clearErrorOnFocus("registerEmail", "registerEmailError");
            this.clearErrorOnFocus("forgotPasswordEmail", "forgotPasswordEmailError");
            dom.byId("loginUserName").addEventListener("blur", () => {
                const loginUserNameValue = dom.byId("loginUserName").value.trim();
                if (loginUserNameValue !== "") {
                    this.clearErrorOnBlur("loginUserName","loginUserNameError");
                } else {
                    dom.byId("loginUserNameError").innerHTML = this.displayWarning("Please enter your user name");
                    dom.byId("loginUserNameError").setAttribute("style", "display:block;padding: 5px 5px; margin: 8px 0;");
                    this.styleNode("loginUserName");
                }
            }, false);
            dom.byId("loginPassword").addEventListener("blur", () => {
                const passwordForLogin = dom.byId("loginPassword").value;
                if (passwordForLogin !== "") {
                    this.clearErrorOnBlur("loginPassword", "userPasswordError");
                } else {
                    dom.byId("userPasswordError").innerHTML = this.displayWarning("Please enter your password");
                    dom.byId("userPasswordError").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                    this.styleNode("loginPassword");
                }
            }, false);
            dom.byId("loginButton").addEventListener("click", () => {
                const loginUserNameValue = dom.byId("loginUserName").value.trim();
                const passwordForLogin = dom.byId("loginPassword").value;

                if (!loginUserNameValue || !passwordForLogin) {
                    if (!loginUserNameValue) {
                        dom.byId("loginUserNameError").innerHTML = this.displayWarning("Please enter a user name");
                        this.styleNode("loginUserName");
                    }
                    if (!passwordForLogin) {
                        dom.byId("userPasswordError").innerHTML = this.displayWarning("Please enter a password");
                        this.styleNode("loginPassword");
                    }
                } else {
                    this.loginMethod();
                }
            }, false);
            this.setUsernameInputAttributes();
            if (this.autoComplete) {
                dom.byId("loginUserName").setAttribute("autocomplete", "on");
                dom.byId("forgotPasswordEmail").setAttribute("autocomplete", "on");
                dom.byId("registerEmail").setAttribute("autocomplete", "on");
                dom.byId("registerUserName").setAttribute("autocomplete", "on");
            }
            this.addMobileOptions();
        }
    }

    private displayLabels() {
        if (this.showLabels) {
            dom.byId("userLabel").innerHTML = this.userNameLabel;
            dom.byId("userPassword").innerHTML = this.passwordLabel;
            dom.byId("emailLabel").innerHTML = this.emailLabel;
            dom.byId("forgotEmailLabel1").innerHTML = this.emailLabel;
            dom.byId("userPassword2").innerHTML = this.passwordLabel;
            dom.byId("userPassword1").innerHTML = this.passwordLabel;
            dom.byId("userLabel1").innerHTML = this.userNameLabel;
            dom.byId("tab1").innerHTML = this.loginTab;
            dom.byId("tab2").innerHTML = this.signupTab;
            dom.byId("tab3").innerHTML = this.forgotTab;
            dom.byId("domtablabel1").innerHTML = this.loginTab;
            dom.byId("domtablabel2").innerHTML = this.signupTab;
            dom.byId("domtablabel3").innerHTML = this.forgotTab;
        }
    }

    private displayTabs() {
        if (this.showForgotTab === false) {
            dom.byId("domtablabel2").setAttribute("style", "display: none");
        } else {
            dom.byId("registerUserName").addEventListener("blur", () => {
                const registrationUserNameValue = dom.byId("registerUserName").value.trim();
                if (registrationUserNameValue !== "") {
                    this.clearErrorOnBlur("registerUserName", "registerUserNameError");
                } else {
                    dom.byId("registerUserNameError").innerHTML = this.displayWarning("Please enter a user name");
                    dom.byId("registerUserNameError").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                    this.styleNode("registerUserName");
                }
            }, false);
            dom.byId("registerEmail").addEventListener("blur", () => {
                const emailFromInput = dom.byId("registerEmail").value.trim();
                if (emailFromInput !== "") {
                    this.clearErrorOnBlur("registerEmail","registerEmailError");
                } else {
                    dom.byId("registerEmailError").innerHTML = this.displayWarning("Please enter an email");
                    this.styleNode("registerEmail");
                    dom.byId("registerEmailError").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                }
            }, false);
            dom.byId("registerPassword1").addEventListener("blur", () => {
                const passwordForsignUp = dom.byId("registerPassword1").value;
                if (passwordForsignUp !== "") {
                    this.clearErrorOnBlur("registerPassword1", "registerPassword1Error");
                } else {
                    dom.byId("registerPassword1Error").innerHTML = this.displayWarning("Please enter password");
                    this.styleNode("registerPassword1");
                    dom.byId("registerPassword1Error").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                }
            }, false);
            dom.byId("registerPassword2").addEventListener("blur", () => {
                const confirmPasswordForsignUp = dom.byId("registerPassword2").value;
                if (confirmPasswordForsignUp !== "") {
                    this.clearErrorOnBlur("registerPassword2","registerPassword2Error")
                } else {
                    dom.byId("registerPassword2Error").innerHTML = this.displayWarning("Please confirm password");
                    this.styleNode("registerPassword2");
                    dom.byId("registerPassword2Error").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                }
            }, false);
            dom.byId("signup").addEventListener("click", () => {
                const registrationUserNameValue = dom.byId("registerUserName").value.trim();
                const emailFromInput = dom.byId("registerEmail").value.trim();
                const passwordForsignUp = dom.byId("registerPassword1").value;
                const confirmPasswordForsignUp = dom.byId("registerPassword2").value;

                const regulaExpressionUpperCase = new RegExp("[A-Z]");
                if (!registrationUserNameValue || !emailFromInput || !passwordForsignUp || !confirmPasswordForsignUp) {
                    if (!registrationUserNameValue) {
                        dom.byId("registerUserNameError").innerHTML = this.displayWarning("Please enter a user name");
                        this.styleNode("registerUserName");
                    }
                    if (!emailFromInput) {
                        dom.byId("registerEmailError").innerHTML = this.displayWarning("Please enter an email");
                        this.styleNode("registerEmail");
                    }
                    if (!passwordForsignUp) {
                        dom.byId("registerPassword1Error").innerHTML = this.displayWarning("Please enter a password");
                        this.styleNode("registerPassword1");
                    }
                    if (!confirmPasswordForsignUp) {
                        dom.byId("registerPassword2Error").innerHTML = this.displayWarning("Please confirm password");
                        this.styleNode("registerPassword2");
                    }

                } else if (regulaExpressionUpperCase.test(emailFromInput)) {
                    dom.byId("registerEmailError").innerHTML = this.displayWarning("Email contains uppercase");
                    this.styleNode("registerEmail");
                    dom.byId("registerEmailError").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                } else if ((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailFromInput)) === false) {
                    dom.byId("registerEmailError").innerHTML = this.displayWarning("Invalid email");
                    this.styleNode("registerEmail");
                    dom.byId("registerEmailError").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                } else if (passwordForsignUp !== confirmPasswordForsignUp) {
                    dom.byId("registerPassword2Error").innerHTML = this.displayWarning("Passwords do not match");
                    this.styleNode("registerPassword2");
                } else {
                    this.signUpMethod();
                }
            }, false);
        }
        if (this.showSignupTab === false) {
            dom.byId("domtablabel3").setAttribute("style", "display: none");
        } else {
            dom.byId("forgotPasswordEmail").addEventListener("blur", () => {
                const forgotPasswordValue = dom.byId("forgotPasswordEmail").value.trim();
                if (forgotPasswordValue !== "") {
                    this.clearErrorOnBlur("forgotPasswordEmail","forgotPasswordEmailError");
                } else {
                    dom.byId("forgotPasswordEmailError").innerHTML = this.displayWarning("Please enter an email");
                    this.styleNode("forgotPasswordEmail");
                    dom.byId("forgotPasswordEmailError").setAttribute("style", "display:block; padding: 5px 5px; margin: 8px 0;");
                }
            }, false);
            dom.byId("resetPassword").addEventListener("click", () => {
                const emailValue = dom.byId("forgotPasswordEmail").value.trim();

                if (!emailValue) {
                    dom.byId("forgotPasswordEmailError").innerHTML = this.displayWarning("Please enter an email");
                    this.styleNode("forgotPasswordEmail");
                } else {
                    this.recoverPassword();
                }
            }, false);
            dom.byId("registerPassword2").addEventListener("blur", () => {
                this.validatePasswordFields();
            }, false);

            dom.byId("passwordVisibility").addEventListener("click", () => {
                if (this.isUnMask === false) {
                    this.isUnMask = true;
                    dom.byId("loginPassword").setAttribute("type", "text");
                    dom.byId("passwordVisibility").innerHTML = "Hide";

                } else {
                    this.isUnMask = false;
                    dom.byId("loginPassword").setAttribute("type", "password");
                    dom.byId("passwordVisibility").innerHTML = "Show";
                }
            }, false);
        }
    }

    private addMobileOptions() {
        if (dojoHas("ios") || dojoHas("android") || dojoHas("bb")) {
            dom.byId("loginUserName").setAttribute("type", this.keyboardType);
        }
    }

    private validateEmail(mail: string): boolean {
        return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail));
    }

    private validatePasswordFields() {
        if (dom.byId("registerPassword1").value !== dom.byId("registerPassword2").value) {
            // tslint:disable-next-line:max-line-length
            dom.byId("warningNode2").innerHTML = this.displayWarning("Passwords dont match! Please check and try again.");
        } else {
            dom.byId("warningNode2").innerHTML = this.displayWarning("");
        }
    }

    private signUpMethod() {
        if (this.validateEmail(dom.byId("registerEmail").value)) {
            mx.data.create({
                callback: (object) => {
                    object.set(this.userName, this.changeCase(dom.byId("registerUserName").value));
                    object.set(this.email, dom.byId("registerEmail").value);
                    object.set(this.password, dom.byId("registerPassword1").value);
                    object.set(this.password, dom.byId("registerPassword2").value);
                    this.executeMicroflow(this.signupMicroflow, object.getGuid());
                },
                entity: this.personLogin,
                error: () => {
                    mx.ui.error("Could not commit object:");
                }
            });
        } else {
            dom.byId("registerEmailError").innerHTML = this.displayWarning("The Email address you entered is invalid.");
        }
    }

    private displayWarning(WarningText: string) {
        const WarningTextSample = "<div style='color:red; display: block;>" +
            WarningText +
            "</div>";
        return WarningTextSample;
    }

    private styleNode(elementId: string, elementErrorId?: string) {
        dom.byId(elementId).setAttribute("style", "display:block;border:1px solid red;");
        if (elementErrorId) {
            dom.byId(elementId).setAttribute("style", "padding: 5px 5px; margin: 8px 0;");
        }
    }

    private loginMethod() {
        const UserName = this.changeCase(dom.byId("loginUserName").value).trim();
        const Password = dom.byId("loginPassword").value;

        if (this.showprogress) {
            this.indicator = mx.ui.showProgress();
        }
        if ((UserName.trim()) || (Password !== "")) {
            mx.login(UserName, Password,
                () => {
                    if (this.indicator) { mx.ui.hideProgress(this.indicator); }
                },
                () => {
                    if (this.showLoginFailureWarning) {
                        if (this.loginForm_FailedAttempts === 1) {
                            this.message += "</br>" + this.loginFailureText;
                        }
                        this.loginForm_FailedAttempts = this.loginForm_FailedAttempts + 1;
                    }
                    dom.byId("warningNode").innerHTML = this.displayWarning(this.message);

                    if (this.clearPassword) {
                        dom.byId("loginUserName").setAttribute("value", "");
                    }
                    if (this.clearUserName) {
                        dom.byId("loginPassword").setAttribute("value", "");
                    }
                    if (this.indicator) { mx.ui.hideProgress(this.indicator); }
                });
        } else {
            dom.byId("warningNode").innerHTML = this.displayWarning(this.emptyText);
        }
    }

    private focusUserName() {
        setTimeout(() => {
            dom.byId("loginUserName").focus();
        }, 100);
    }

    private setUsernameInputAttributes() {
        if (this.autoCorrect) {
            dom.byId("loginUserName").setAttribute("autocorrect", "on");
            dom.byId("registerUserName").setAttribute("autocorrect", "on");

        }
        if (this.autoCapitalize && this.convertCase !== "none") {
            dom.byId("loginUserName").setAttribute("autocapitalize", "on");
        }
        if (this.autoComplete) {
            dom.byId("loginUserName").setAttribute("autocomplete", "on");
            dom.byId("loginPassword").setAttribute("autocomplete", "on");
        }
        if (this.convertCase !== "none") {
            dom.byId("loginUserName").setAttribute("autocapitalize", "on");
            dom.byId("registerUserName").setAttribute("autocapitalize", "on");
        }
        if (this.convertCase === "toLowerCase") {
            dom.byId("loginUserName").setAttribute("text-transform", "lowercase");
            dom.byId("registerUserName").setAttribute("text-transform", "lowercase");
        } else if (this.convertCase === "toUpperCase") {
            dom.byId("loginUserName").setAttribute("text-transform", "uppercase");
            dom.byId("registerUserName").setAttribute("text-transform", "uppercase");
        }
    }

    private recoverPassword() {
        if (this.validateEmail(dom.byId("forgotPasswordEmail").value)) {
            mx.data.create({
                callback: object => {
                    object.set(this.email, dom.byId("forgotPasswordEmail").value);
                    this.executeMicroflow(this.forgetPasswordMicroflow, object.getGuid());
                },
                entity: this.personLogin,
                error: () => {
                    mx.ui.error("Failed to fetch email address!");
                }
            });
        } else {
            // tslint:disable-next-line:max-line-length
            dom.byId("forgotPasswordEmailError").innerHTML = this.displayWarning("The Email address you entered is invalid.");
        }
    }

    private changeCase(username: string): string {
        if (this.convertCase === "toUpperCase") {
            return username.toUpperCase();
        } else if (this.convertCase === "toLowerCase") {
            return username.toLowerCase();
        }
        return username;
    }

    private executeMicroflow(microflow: string, guid: string) {
        if (microflow === this.forgetPasswordMicroflow && guid) {
            mx.ui.action(microflow, {
                error: () => {
                    mx.ui.error("Could not execute mircoflow");
                },
                params: {
                    applyto: "selection",
                    guids: [guid]
                }
            }, this);
        } else if (microflow === this.signupMicroflow) {
            const registrationUserNameValue = dom.byId("registerUserName").value;
            const registrationPasswordValue = dom.byId("registerPassword1").value;
            if (registrationPasswordValue || registrationUserNameValue.trim()) {
                dom.byId("warningNode").innerHTML = this.displayWarning(this.emptyText);
            }
            if (microflow && guid) {
                mx.ui.action(microflow, {
                    callback: (object) => {
                        if (object) {
                            mx.login(this.changeCase(registrationUserNameValue), registrationPasswordValue,
                                // tslint:disable-next-line:no-empty
                                () => { },
                                () => {
                                    if (this.showLoginFailureWarning) {
                                        if (this.loginForm_FailedAttempts === 1) {
                                            this.message += "</br>" + this.loginFailureText;
                                        }
                                        this.loginForm_FailedAttempts = this.loginForm_FailedAttempts + 1;
                                    }
                                    dom.byId("warningNode").innerHTML = this.displayWarning(this.message);
                                });
                        }
                    },
                    error: () => {
                        mx.ui.error("Failed to login! Please ensure that username and password are correct");
                    },
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    }
                }, this);
            }
        }
    }
}

// tslint:disable-next-line:only-arrow-functions
dojoDeclare("widget.TabbedLogin", [WidgetBase], function (Source: any) {
    const result: any = {};
    for (const i in Source.prototype) {
        if (i !== "constructor" && Source.prototype.hasOwnProperty(i)) {
            result[i] = Source.prototype[i];
        }
    }
    return result;
}(TabbedLogin));