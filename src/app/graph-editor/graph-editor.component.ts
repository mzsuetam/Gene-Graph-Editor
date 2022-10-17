import { Component, OnInit } from '@angular/core';
import { Graph, Node, Edge, PhysicalNodeProperties, PhysicalEdgeProperties, Badge } from './GraphModelElements'

//////////////////////////////

export const NODE_TAG = "n"

export enum EdgeType { e,f }

//////////////////////////////


enum Tool { HAND, EDIT, ADDNODE, ADDEDGE }

@Component({
  selector: 'app-graph-editor',
  templateUrl: './graph-editor.component.html',
  styleUrls: ['./graph-editor.component.css']
})
export class GraphEditorComponent implements OnInit {

  settings = {
    view_panning_enabled: true,
    
    show_curtain: false,
    show_properties_window: {
      node: false,
      edges: [] as boolean[],
    },

    physical: {
      coord_sys: {
        x_offset: 0,
        y_offset: 0,
        grad_factor: 100,
        grad_size: 30
      },

      sub_text: 3,
      sup_text: -12,
      node_size: 60,
      safe_distance_factor: 3
    }
  }

  tool : Tool = Tool.HAND
  tool_edge_type : number = 0

  mouse : Mouse = new Mouse;

  graph : Graph = new Graph;

  focused_node : number = -1; // for properties windows
  focused_edges : number[] = []; // for properties windows
  selected_nodes : number[] = []

  deletion_locked = true
  
  constructor(){

    for (let i=0; i<this.getEdgeTypesLength(); i++){
      this.settings.show_properties_window.edges.push(false)
      this.focused_edges.push(-1)
    }

    document.addEventListener('mousemove', (event) => {
      this.mouse.x = event.clientX - document.getElementById('canvas')!.offsetLeft
      this.mouse.y = event.clientY - document.getElementById('canvas')!.offsetTop

      if ( !this.mouse.lb_pressed && ( this.mouse.mb_pressed || this.mouse.rb_pressed ) ){
        if ( !this.settings.view_panning_enabled ) return
        this.settings.physical.coord_sys.x_offset += event.movementX
        this.settings.physical.coord_sys.y_offset += event.movementY
        this.mouse.prev_x = event.clientX
        this.mouse.prev_y = event.clientY
      }
    });

    document.addEventListener('mousedown', (event) => {
      if ( event.button == 1 || event.button == 2 ) {
        var int = setInterval(() => {
          //<-- actions when we hold the button
          if ( event.button == 1 ) this.mouse.mb_pressed = true
          if ( event.button == 2 ) this.mouse.rb_pressed = true
          
        }, 10)
      
        document.addEventListener("mouseup", () => {
          clearInterval(int);
          if ( event.button == 1 ) this.mouse.mb_pressed = false
          if ( event.button == 2 ) this.mouse.rb_pressed = false
        })
      }
    });

    document.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    });
  }

  ngOnInit(){
    this.settings.physical.coord_sys.x_offset = document.getElementById('canvas')!.offsetWidth/2
    this.settings.physical.coord_sys.y_offset = document.getElementById('canvas')!.offsetHeight/2

    document.getElementById('canvas')!.addEventListener('click', (event) => {

      if ( this.tool == Tool.ADDNODE ){
        this.addNode(this.mouse.x - this.settings.physical.coord_sys.x_offset,this.mouse.y - this.settings.physical.coord_sys.y_offset)
        this.focused_node = this.graph.nodes[this.graph.nodes.length-1].id
        this.settings.show_curtain = true
        this.settings.show_properties_window.node = true
      }
    });

    //// THIS METHOD IS ONLY FOR PRESENTATION
    this.loadExample();
    ////
  }

  getEdgeTypesLength(): number{
    return Object.keys(EdgeType).filter((v) => isNaN(Number(v))).length;
  }


  loadExample(){
    this.addNode(-550,0,{text:"ST", sub:"A", sup:""})
    this.addNode(-250,-300, {text:"bage", sub:"III", sup:""})
    this.addNode(-250,300)
    this.addNode(0,0, {text:"END", sub:"", sup:""})
    this.addNode(250,300)
    this.addNode(250,-300,{text:"n", sub:"5", sup:"'"})
    this.addNode(550,0,{text:"ST", sub:"B", sup:""})
    
    this.addEdge(0, 1, EdgeType.e, [100,-200])
    this.addEdge(0, 2, EdgeType.e, [100,200])
    this.addEdge(1, 5, EdgeType.e)
    this.addEdge(2, 3, EdgeType.e)
    this.addEdge(5, 3, EdgeType.e)
    this.addEdge(4, 2, EdgeType.e, [], {text:"badge", sub:"without", sup:"v_vector"})
    this.addEdge(4, 6, EdgeType.e, [200,-100])
    this.addEdge(5, 6, EdgeType.e, [200,100])
    
    this.addEdge(3, 0, EdgeType.f, [-300,150])
    this.addEdge(3, 1, EdgeType.f, [-200,-100])
    this.addEdge(3, 4, EdgeType.f, [0,200])
    this.addEdge(3, 6, EdgeType.f, [300,150], {text:"text", sub:"sub", sup:"sup"})
  }

  public getNodeById(id: Number): Node{
    return this.graph.nodes.filter(obj => obj.id === id)[0]
  }

  public getEdgeById(type: EdgeType, id: Number): Edge{
    return this.graph.edges[type].filter(obj => obj.id === id)[0]
  }

  public async addNode(x:number, y:number, badge?: Badge){
    let id = this.graph.nodes.length ?  this.graph.nodes[this.graph.nodes.length-1].id + 1 : 0
    let new_node = new Node(id, this.settings.physical.node_size, x,y, this.getEdgeTypesLength(), badge)

    this.graph.nodes.push( new_node )
    
    await new Promise(f => setTimeout(f, 100));

    document.getElementById( "node-"+id )!.addEventListener('mousedown', (e) => {
      if ( this.tool == Tool.HAND && e.button == 0 ){
        this.mouse.lb_pressed = true
        var i = 0
        var int = setInterval(() => {
          //<-- actions when we hold the button
          new_node.physical.x = this.mouse.x - this.settings.physical.coord_sys.x_offset
          new_node.physical.y = this.mouse.y - this.settings.physical.coord_sys.y_offset

          for ( let t=0; t<this.getEdgeTypesLength(); t++ ){
            for( let i=0; i< new_node.edges_out[t].length; i++ ){
              let dx = new_node.physical.x - this.getEdgeById(t,new_node.edges_out[t][i]).physical.x
              let dy = new_node.physical.y - this.getEdgeById(t,new_node.edges_out[t][i]).physical.y
  
              this.getEdgeById(t,new_node.edges_out[t][i]).physical.x = new_node.physical.x
              this.getEdgeById(t,new_node.edges_out[t][i]).physical.y = new_node.physical.y
              
              this.getEdgeById(t,new_node.edges_out[t][i]).physical.width -= dx
              this.getEdgeById(t,new_node.edges_out[t][i]).physical.height -= dy
            }
            for( let i=0; i< new_node.edges_in[t].length; i++ ){
              let dw = new_node.physical.x - this.getEdgeById(t,new_node.edges_in[t][i]).physical.x
              let dh = new_node.physical.y - this.getEdgeById(t,new_node.edges_in[t][i]).physical.y
              
              this.getEdgeById(t,new_node.edges_in[t][i]).physical.width = dw
              this.getEdgeById(t,new_node.edges_in[t][i]).physical.height = dh
              
            }
          }
        }, 10)
      
        document.addEventListener("mouseup", () => {
          clearInterval(int);
          this.mouse.lb_pressed = false
        //<-- actions when we release the button
          // console.log("release")
      
        })
      }
      else if ( this.tool == Tool.EDIT && e.button == 0 ){
        this.focused_node = id
        this.settings.show_curtain = true
        this.settings.show_properties_window.node = true
      }

    });
  }

  public async addEdge(start:number, end:number, type: EdgeType, v_vector?: number[], badge?: Badge){
    let id = this.graph.edges[type].length ? this.graph.edges[type][this.graph.edges[type].length-1].id + 1 : 0
    let new_edge = new Edge(id, this, start, end, type, v_vector, badge)

    this.getNodeById(start).edges_out[type].push(id)
    this.getNodeById(end).edges_in[type].push(id)
    
    this.graph.edges[type].push( new_edge )
    
    await new Promise(f => setTimeout(f, 100));

    document.getElementById( "edge-"+type+"-"+id+"-path" )!.addEventListener('mousedown', (e) => {
      if ( this.tool == Tool.HAND &&  e.button == 0 ){
        this.mouse.lb_pressed = true
        var int = setInterval(() => {
          //<-- actions when we hold the button
          if ( !this.isEdgeFlipped(type,id) ){
            let x0 = this.getNodeById(new_edge.start_node).physical.x
            let y0 = this.getNodeById(new_edge.start_node).physical.y

            let dx = Math.abs( this.mouse.x - this.settings.physical.coord_sys.x_offset - this.getNodeById(new_edge.end_node).physical.x )
            let dy = Math.abs( this.mouse.y - this.settings.physical.coord_sys.y_offset - this.getNodeById(new_edge.end_node).physical.y )
            let c = Math.sqrt( dx*dx + dy*dy )

            new_edge.physical.v1_x = this.mouse.x - this.settings.physical.coord_sys.x_offset - x0
            new_edge.physical.v1_y = this.mouse.y - this.settings.physical.coord_sys.y_offset - y0

            new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.x - this.settings.physical.coord_sys.x_offset - x0 :  new_edge.physical.v2_x
            new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.y - this.settings.physical.coord_sys.y_offset - y0 :  new_edge.physical.v2_y
          }
          else{
            let x0 = this.getNodeById(new_edge.start_node).physical.x + new_edge.physical.width
            let y0 = this.getNodeById(new_edge.start_node).physical.y + new_edge.physical.height

            let dx = Math.abs( this.mouse.x + this.settings.physical.coord_sys.x_offset - this.getNodeById(new_edge.end_node).physical.x )
            let dy = Math.abs( this.mouse.y + this.settings.physical.coord_sys.y_offset - this.getNodeById(new_edge.end_node).physical.y )
            let c = Math.sqrt( dx*dx + dy*dy )
            
            new_edge.physical.v1_x = x0 - this.mouse.x + this.settings.physical.coord_sys.x_offset
            new_edge.physical.v1_y = y0 - this.mouse.y + this.settings.physical.coord_sys.y_offset

            new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? x0 - this.mouse.x + this.settings.physical.coord_sys.x_offset :  new_edge.physical.v2_x
            new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? y0 - this.mouse.y + this.settings.physical.coord_sys.y_offset :  new_edge.physical.v2_y

          }
        }, 10)
      
        document.addEventListener("mouseup", () => {
          clearInterval(int);
          this.mouse.lb_pressed = false
        //<-- actions when we release the button
          // console.log("release")
      
        })
      }
      else if ( this.tool == Tool.EDIT && e.button == 0 ){
        this.focused_edges[type] = id
        this.settings.show_curtain = true
        this.settings.show_properties_window.edges[type] = true
      }
    });

  }

  deleteNode( id:number ){
    let n = this.getNodeById(id)

    for (let t=0; t<this.getEdgeTypesLength(); t++){
      for (let e of n.edges_in[t] ){
        this.deleteEdge(t,e)
      }
      for (let e of n.edges_out[t] ){
        this.deleteEdge(t,e)
      }
    }

    this.focused_node = -1
    this.graph.nodes = this.graph.nodes.filter( obj => obj.id !== id )
  }

  deleteEdge( t: EdgeType, id:number ){
    let e = this.getEdgeById(t,id)
    let start_node = this.getNodeById(e.start_node)
    let end_node = this.getNodeById(e.end_node)
    
    start_node.edges_out[t] = start_node.edges_out[t].filter( obj => obj !== id )
    end_node.edges_in[t] = end_node.edges_in[t].filter( obj => obj !== id )

    this.focused_edges[t] = -1
    this.graph.edges[t] = this.graph.edges[t].filter( obj => obj.id !== id )
  }

  isEdgeFlipped(t: EdgeType, e : number) : boolean{
    let edge = this.getEdgeById(t,e)
    let x1 = this.getNodeById(edge.start_node).physical.x
    let x2 = this.getNodeById(edge.end_node).physical.x
    return x1 > x2
  }

  isEdgeLongEnough(t: EdgeType, e :number) : boolean{
    let edge = this.getEdgeById(t, e)
    let dx = Math.abs( this.getNodeById(edge.start_node).physical.x - this.getNodeById(edge.end_node).physical.x )
    let dy = Math.abs( this.getNodeById(edge.start_node).physical.y - this.getNodeById(edge.end_node).physical.y )
    let c = Math.sqrt( dx*dx + dy*dy )

    return c > this.settings.physical.node_size 
  }

  async flipSelection(e : number){
    if ( this.tool != Tool.ADDEDGE ) return
    if ( this.isSelected(e) ){
      this.selected_nodes = this.selected_nodes.filter(x => x != e)
    }
    else{
      this.selected_nodes.push(e)
    }
    if ( this.selected_nodes.length == 2 ) {

      let t : EdgeType = this.tool_edge_type
      let e = this.graph.edges[t].length ? this.graph.edges[t][this.graph.edges[t].length - 1].id + 1 : 0
      this.addEdge(this.selected_nodes[0],this.selected_nodes[1], t )
      this.focused_edges[t] = e
      this.settings.show_curtain = true
      this.settings.show_properties_window.edges[t] = true

      // this.selected_nodes = [] in curtain hiding
    }
  }

  isSelected(n : number): boolean{
    let out = this.selected_nodes.filter(x => x == n) // only 1 because we store id's
    return out.length > 0 ? true : false
  }

  setTool(t: Tool){
    this.tool = t
    if ( this.tool != Tool.ADDEDGE ){
      this.selected_nodes = []
    }
  }

  getCursorStyle(x: string) : string{
    if ( this.tool == Tool.HAND ){
      if ( x == 'canvas' ) return 'default'
      else if ( x == 'node' ) return 'move'
      else if ( x == 'edge' ) return 'sw-resize'
    }
    else if ( this.tool == Tool.EDIT ){
      if ( x == 'canvas' ) return 'default'
      else if ( x == 'node' ) return 'crosshair'
      else if ( x == 'edge' ) return 'crosshair'
    }
    else if ( this.tool == Tool.ADDNODE ){
      if ( x == 'canvas' ) return 'pointer'
      else if ( x == 'node' ) return 'inherit'
      else if ( x == 'edge' ) return 'inherit'
    }
    else if ( this.tool == Tool.ADDEDGE ){
      if ( x == 'canvas' ) return 'default'
      else if ( x == 'node' ) return 'pointer'
      else if ( x == 'edge' ) return 'default'
    }
    return ""
  }

  closeCurtainAndPropertiesWindows(){
    this.settings.show_curtain = false
    this.settings.show_properties_window.node = false
    for (let t=0; t<this.getEdgeTypesLength();t++){
      this.settings.show_properties_window.edges[t] = false
    }
    this.deletion_locked = true
    this.selected_nodes = []
  }

  getEdgeTags(): string[]{
    let tab = []
    for ( let t=0; t<this.getEdgeTypesLength(); t++ ){
      tab.push(this.getEdgeTag(t))
    }
    return tab
  }

  getEdgeTag(x:number): string{
    return EdgeType[x]
  }

  setToolEdgeType(t: EdgeType){
    this.tool_edge_type = t
  }

  getInputValueAsString(event : Event) : string {
    return (event.target as HTMLInputElement).value;
  }

  getInputValueAsNumber(event : Event) : number {
    return (event.target as HTMLInputElement).value as unknown as number;
  }

  proceedDeletion(element_type: string, edge_type: EdgeType = -1){
    if ( this.deletion_locked ){
      this.deletion_locked = false
      return 
    }

    // if ( this.deletion_locked == false ) { ...
    if ( element_type == 'node'){
      this.deleteNode(this.focused_node)
    }
    else if ( element_type == "edge" ){
      this.deleteEdge(edge_type, this.focused_edges[edge_type])
    }
    this.closeCurtainAndPropertiesWindows()
  }

  getOffsetForPrint(axis: number):number{
    if ( axis == 0 ){
      return - this.settings.physical.coord_sys.x_offset + document.getElementById('canvas')!.offsetWidth/2
    }
    else{ // if ( axis == 1 ) { ...
      return - this.settings.physical.coord_sys.y_offset + document.getElementById('canvas')!.offsetHeight/2
    }
  }

  resetOffset(){
    if ( !this.settings.view_panning_enabled ) return
    this.settings.physical.coord_sys.x_offset = document.getElementById('canvas')!.offsetWidth/2
    this.settings.physical.coord_sys.y_offset = document.getElementById('canvas')!.offsetHeight/2
  }

  toogleDraging(){
    this.settings.view_panning_enabled = !this.settings.view_panning_enabled 
  }

  getCsAxisGrad(axis: number){
    let tab = [] as number[]
    let max = 0
    if ( axis == 0 ){
      max = document.getElementById('canvas')!.offsetHeight / this.settings.physical.coord_sys.grad_factor + 1
    }
    else{ // if ( axis == 1 ) { ...
      max = document.getElementById('canvas')!.offsetWidth / this.settings.physical.coord_sys.grad_factor + 1
    }      
    for ( let i=0; i<max;i++){
      tab.push(i)
    }
    return tab
  }

  getCsAxisPosition(axis:number, grid:boolean = false) : string{
    let max_width = document.getElementById('canvas')!.offsetWidth
    let max_height = document.getElementById('canvas')!.offsetHeight
    if ( axis == 0 ){
      let y_off = this.settings.physical.coord_sys.y_offset
      if ( y_off < 5){
        return 'top: 10px;'
      }
      if ( y_off > max_height - 5 ){
        if ( grid ) return 'bottom: '+ ( 5 - this.settings.physical.coord_sys.grad_size ) + 'px;'
        return 'bottom: 5px;'
      }
      return 'top:'+y_off+'px;'
    }
    if ( axis == 1 ){
      let x_off = this.settings.physical.coord_sys.x_offset
      if ( x_off < 5){
        return 'left: 10px;'
      }
      if ( x_off > max_width -5 ){
        if ( grid ) return 'right: '+ ( 5 - this.settings.physical.coord_sys.grad_size )  + 'px;'
        return 'right: 5px;'
      }
      return 'left:'+x_off+'px;'
    }
    return ""
  }

  getCsAxisGradLabelPosition(axis:number){
    let max_width = document.getElementById('canvas')!.offsetWidth
    let max_height = document.getElementById('canvas')!.offsetHeight
    if ( axis == 0 ){
      let x_off = this.settings.physical.coord_sys.x_offset
      if ( x_off > max_width - 50 ){
        return 'transform: translate(calc( -15px - 100%),-40%);'
      }
      return 'transform: translate(35px, -40%);'
    }
    if ( axis == 1 ){
      let y_off = this.settings.physical.coord_sys.y_offset
      if ( y_off > max_height - 5 ){
        return 'transform: translate(10px, -70%);'
      }
      return 'transform: translate(10px, 100%);'
    }
    return ""
  }
  
  getCsAxisGradLabelValue(axis:number, i:number) : string{
    if ( axis == 0 ){
      let grad_factor : number = this.settings.physical.coord_sys.grad_factor
      let dx : number = Math.floor( this.settings.physical.coord_sys.x_offset /grad_factor )
      return ( (dx-i)*(-100) ).toString()
    }
    if ( axis == 1 ){
      let grad_factor : number = this.settings.physical.coord_sys.grad_factor
      let dy : number = Math.floor( this.settings.physical.coord_sys.y_offset /grad_factor )
      return ( (dy-i)*(-100) ).toString()
    }
    return ""
  }
}

export class Mouse {
  x: number;
  y: number;

  prev_x: number;
  prev_y: number;

  lb_pressed = false;
  mb_pressed = false;
  rb_pressed = false;

  constructor(){
    this.x = this.prev_x = 0
    this.y = this.prev_y = 0
  }

}

