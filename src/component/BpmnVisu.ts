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
import BpmnVisuOptions from './BpmnVisuOptions';

export default class BpmnVisu {
  private mxClient: typeof mxgraph.mxClient = MxGraphFactoryService.getMxGraphProperty('mxClient');
  private mxUtils: typeof mxgraph.mxUtils = MxGraphFactoryService.getMxGraphProperty('mxUtils');

  public readonly graph: mxgraph.mxGraph;

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

  public load(xml: string): void {
    try {
      // TODO the BpmnParser should be a field and injected (see #110)
      const bpmnModel = defaultBpmnParser().parse(xml);
      new MxGraphRenderer(this.graph).render(bpmnModel);
    } catch (e) {
      // TODO error handling
      this.mxUtils.alert('Cannot load bpmn diagram: ' + e.message);
      throw e;
    }
  }
}
