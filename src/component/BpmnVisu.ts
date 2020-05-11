/**
 * Copyright 2020 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import MxGraphConfigurator from './mxgraph/MxGraphConfigurator';
import { mxgraph } from 'ts-mxgraph';
import MxGraphRenderer from './mxgraph/MxGraphRenderer';
import { defaultBpmnParser } from './parser/BpmnParser';
import { MxGraphFactoryService } from '../service/MxGraphFactoryService';
import BpmnVisuOptions, { ZoomOptions } from './BpmnVisuOptions';

export default class BpmnVisu {
  private mxClient: typeof mxgraph.mxClient = MxGraphFactoryService.getMxGraphProperty('mxClient');
  private mxEvent: typeof mxgraph.mxEvent = MxGraphFactoryService.getMxGraphProperty('mxEvent');
  private mxOutline: typeof mxgraph.mxOutline = MxGraphFactoryService.getMxGraphProperty('mxOutline');
  private mxUtils: typeof mxgraph.mxUtils = MxGraphFactoryService.getMxGraphProperty('mxUtils');
  private mxWindow: typeof mxgraph.mxWindow = MxGraphFactoryService.getMxGraphProperty('mxWindow');

  public readonly graph: mxgraph.mxGraph;
  // TODO make this an option (set with BpmnVisuOptions and updatable at runtime)
  private fitOnLoad = true;

  constructor(protected container: Element, options?: BpmnVisuOptions) {
    try {
      if (!this.mxClient.isBrowserSupported()) {
        this.mxUtils.error('Browser is not supported!', 200, false);
      }
      // Instantiate and configure Graph
      const configurator = new MxGraphConfigurator(this.container, options);
      this.graph = configurator.getGraph();
    } catch (e) {
      // TODO error handling
      this.mxUtils.alert('Cannot start application: ' + e.message);
      throw e;
    }
  }

  /* eslint-disable no-console */ public load(xml: string): void {
    console.info('Start loading BPMN');
    try {
      // TODO the BpmnParser should be a field and injected (see #110)
      const bpmnModel = defaultBpmnParser().parse(xml);
      console.info('Parsing done');
      new MxGraphRenderer(this.graph).render(bpmnModel);
      console.info('Rendering done');
      if (this.fitOnLoad) {
        this.graph.fit();
        console.info('Fit on load rendering done');
      }
      console.info('BPMN loaded');
    } catch (e) {
      // TODO error handling
      this.mxUtils.alert('Cannot load bpmn diagram: ' + e.message);
      throw e;
    }
  }

  // TODO zoom factor should be configurable (in global BpmnVisuOptions)
  public zoom(options: ZoomOptions): void {
    switch (options) {
      case ZoomOptions.Actual:
        this.graph.zoomActual();
        break;
      case ZoomOptions.Fit:
        this.graph.fit();
        break;
      case ZoomOptions.In:
        this.graph.zoomIn();
        break;
      case ZoomOptions.Out:
        this.graph.zoomOut();
        break;
      default:
        throw new Error('Unsupported zoom option');
    }
  }

  public toggleOutline(): void {
    console.info('Graph toggle outline');
    if (this.outlineWindow == null) {
      this.showOutline();
    } else {
      this.outlineWindow.setVisible(!this.outlineWindow.isVisible());
    }
  }

  // adapted from https://github.com/jgraph/mxgraph2/blob/a15684d7c8b71074e4c73d89c9192459288e0bf4/javascript/src/js/editor/mxEditor.js#L2779-L2823

  private outlineWindow: mxgraph.mxWindow;
  private outline: mxgraph.mxOutline;
  private showOutline(): void {
    const create = this.outlineWindow == null;

    if (create) {
      const div = document.createElement('div');

      div.style.overflow = 'hidden';
      div.style.position = 'relative';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.background = 'white';
      div.style.cursor = 'move';

      // TODO window position is currently at the bottom of the page
      // the mxWindow api doc provides lot of example about how to manage and limit position
      // title: any,
      //     content: any,
      //     x: any,
      //     y: any,
      //     width: any,
      //     height?: any,
      //     minimizable?: any,
      //     movable?: any,
      //     replaceNode?: any,
      //     style?: any,
      const wnd = new this.mxWindow('Outline', div, 600, 480, 200, 200, false);
      // TODO default implementaton requires some images to be available, currently generates 404
      // path to images can be overriden: see https://github.com/jgraph/mxgraph2/blame/5d407ab0e9d6103d1245d1ebe216dd46b5c7be5a/javascript/src/js/util/mxWindow.js#L228-L256
      // for instance mxWindow.prototype.minimizeImage

      // Creates the outline in the specified div
      // and links it to the existing graph
      const outline = new this.mxOutline(this.graph, div);
      wnd.setClosable(false);
      wnd.setResizable(false);
      // TODO missing in types declaration
      //wnd.destroyOnClose = false;

      // TODO check if we need this
      wnd.addListener(this.mxEvent.RESIZE_END, function() {
        outline.update(false);
      });

      this.outlineWindow = wnd;
      this.outline = outline;
    }

    // Finally shows the outline
    this.outlineWindow.setVisible(true);
    this.outline.update(true);
  }
}
