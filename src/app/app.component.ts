import { Component } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { GraphEditorComponent } from './graph-editor/graph-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gene-graph-editor'

  constructor(){

  }
}