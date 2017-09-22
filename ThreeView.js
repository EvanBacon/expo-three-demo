import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';
import ExpoTHREE from 'expo-three';
import PropTypes from 'prop-types';
export default class ThreeView extends React.Component {
    static propTypes = {
        style: View.propTypes.style,
        onContextCreate: PropTypes.func.isRequired,
        render: PropTypes.func.isRequired
    }
    render = () => (
        <Expo.GLView
            style={{ flex: 1 }}
            onContextCreate={this._onGLContextCreate} />
    );

    _onGLContextCreate = async (gl) => {
        gl.createRenderbuffer = (() => {});
        gl.bindRenderbuffer = (() => {});
        gl.renderbufferStorage = (() => {});
        gl.framebufferRenderbuffer = (() => {});
        await this.props.onContextCreate(gl);

        const render = () => {
            const now = 0.001 * global.nativePerformanceNow();
            const dt = typeof lastFrameTime !== 'undefined'
                ? now - lastFrameTime
                : 0.16666;
            requestAnimationFrame(render);

            this.props.render(dt);
            // NOTE: At the end of each frame, notify `Expo.GLView` with the below
            gl.endFrameEXP();

            lastFrameTime = now;
        }
        render();
    }
}