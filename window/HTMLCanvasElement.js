import React from "react";
import { Dimensions, StatusBar, Platform } from "react-native";
import { GLView } from "expo";

export default class HTMLCanvasElement {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        ctx.canvas = this;

        Object.defineProperty(this, "width", {
            set: val => {
                try {
                    throw new Exception();
                } catch (ex) {
                    //console.log(ex.stack);
                }
                console.log("width", val);
                this._width = val;
            },
            get: () => {
                return this._width;
            }
        });

        this.width = width;
        this.height = height;

        this.style = {
            display: "block",
            width,
            height
        };
        this.parentNode = {
            insertBefore: function () {
                /* NOP */
            },
            currentStyle: {
                "padding-top": 10,
                "padding-bottom": 10,
                "padding-left": 10,
                "padding-right": 10
            },
            clientWidth: width,
            clientHeight: height
        };

        global.document.defaultView = {
            getComputedStyle: function (node) {
                return { "max-width": width, "max-height": height };
            }
        };

    }

    getContext() {
        return this.ctx;
    }

    getAttribute(name) {
        return this[name];
    }

    insertBefore() {
        // ignore this
    }
}
