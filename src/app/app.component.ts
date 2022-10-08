import { Component } from '@angular/core';
import { TitleStrategy } from '@angular/router';

//////////////////////////////

const NODE_TAG = "n"
const EDGE_1_TAG = "e"
const EDGE_2_TAG = "f"

//////////////////////////////

enum EdgeType { E, F }
enum Tool { HAND, EDIT, ADDNODE, ADDEDGE1, ADDEDGE2 }
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'graph-playground';

  settings = {
    dragging_enabled: true,
    
    show_curtain: false,
    show_properties_window: {
      node: false,
      edge_1: false,
      edge_2: false
    },

    physical: {
      sub_text: 3,
      sup_text: -12,
      node_size: 60,
      safe_distance_factor: 3
    }
  }

  tool : Tool = Tool.HAND

  mouse : Mouse = new Mouse;

  nodes : Node[] = [] as Node[]
  edges_1 : Edge[] = [] as Edge[]
  edges_2 : Edge[] = [] as Edge[]

  focused_node : number = -1; // for properties windows
  focused_edge_1 : number = -1; // for properties windows
  focused_edge_2 : number = -1; // for properties windows
  selected_nodes : number[] = []

  deletion_locked = true

  constructor(){

    document.addEventListener('mousemove', (event) => {
      this.mouse.x = event.clientX
      this.mouse.y = event.clientY
    });
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault()
    });
  }


  ngOnInit(){
    document.getElementById('canvas')!.addEventListener('click', (event) => {
      if ( this.tool == Tool.ADDNODE ){
        this.addNode(this.mouse.x,this.mouse.y)
        this.focused_node = this.nodes[this.nodes.length-1].id
        this.settings.show_curtain = true
        this.settings.show_properties_window.node = true
      }
    });

    this.addNode(500,500)
    this.addNode(700,300)
    this.addNode(700,700)
    this.addNode(900,500,{text:"bage", sub:"", sup:"4"})
    
    this.addEdge(0, 1, EdgeType.E)
    this.addEdge(0, 2, EdgeType.E)
    this.addEdge(1, 3, EdgeType.E)
    this.addEdge(2, 3, EdgeType.E)
    
    this.addEdge(3, 2, EdgeType.F)
    this.addEdge(3, 0, EdgeType.F)
    this.addEdge(2, 0, EdgeType.F, {text:"text", sub:"sub", sup:"sup"})
  }

  public getNodeById(id: Number): Node{
    return this.nodes.filter(obj => obj.id === id)[0]
  }

  public getEdge1ById(id: Number): Edge{
    return this.edges_1.filter(obj => obj.id === id)[0]
  }

  public getEdge2ById(id: Number): Edge{
    return this.edges_2.filter(obj => obj.id === id)[0]
  }

  public async addNode(x:number, y:number, badge?: Badge){
    let id = this.nodes.length ?  this.nodes[this.nodes.length-1].id + 1 : 0
    let new_node = new Node(id, this.settings.physical.node_size, x,y, badge)

    this.nodes.push( new_node )
    
    await new Promise(f => setTimeout(f, 100));

    document.getElementById( "node-"+id )!.addEventListener('mousedown', (e) => {
      if ( this.tool == Tool.HAND && e.button == 0 ){
        var i = 0
        var int = setInterval(() => {
          //<-- actions when we hold the button
          if ( this.settings.dragging_enabled ){
            new_node.physical.x = this.mouse.x
            new_node.physical.y = this.mouse.y

            for( let i=0; i< new_node.edges_1_out.length; i++ ){
              let dx = new_node.physical.x - this.getEdge1ById(new_node.edges_1_out[i]).physical.x
              let dy = new_node.physical.y - this.getEdge1ById(new_node.edges_1_out[i]).physical.y

              this.getEdge1ById(new_node.edges_1_out[i]).physical.x = new_node.physical.x
              this.getEdge1ById(new_node.edges_1_out[i]).physical.y = new_node.physical.y
              
              this.getEdge1ById(new_node.edges_1_out[i]).physical.width -= dx
              this.getEdge1ById(new_node.edges_1_out[i]).physical.height -= dy
            }
            for( let i=0; i< new_node.edges_1_in.length; i++ ){
              let dw = new_node.physical.x - this.getEdge1ById(new_node.edges_1_in[i]).physical.x
              let dh = new_node.physical.y - this.getEdge1ById(new_node.edges_1_in[i]).physical.y
              
              this.getEdge1ById(new_node.edges_1_in[i]).physical.width = dw
              this.getEdge1ById(new_node.edges_1_in[i]).physical.height = dh
              
            }

            for( let i=0; i< new_node.edges_2_out.length; i++ ){
              let dx = new_node.physical.x - this.getEdge2ById(new_node.edges_2_out[i]).physical.x
              let dy = new_node.physical.y - this.getEdge2ById(new_node.edges_2_out[i]).physical.y

              this.getEdge2ById(new_node.edges_2_out[i]).physical.x = new_node.physical.x
              this.getEdge2ById(new_node.edges_2_out[i]).physical.y = new_node.physical.y
              
              this.getEdge2ById(new_node.edges_2_out[i]).physical.width -= dx
              this.getEdge2ById(new_node.edges_2_out[i]).physical.height -= dy
            }
            for( let i=0; i< new_node.edges_2_in.length; i++ ){
              let dw = new_node.physical.x - this.getEdge2ById(new_node.edges_2_in[i]).physical.x
              let dh = new_node.physical.y - this.getEdge2ById(new_node.edges_2_in[i]).physical.y
              
              this.getEdge2ById(new_node.edges_2_in[i]).physical.width = dw
              this.getEdge2ById(new_node.edges_2_in[i]).physical.height = dh
              
            }
          }
        }, 10)
      
        document.addEventListener("mouseup", () => {
          clearInterval(int);
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

  public async addEdge(start:number, end:number, type: EdgeType, badge?: Badge){
    // @FIXME: merge this if's
    if ( type == EdgeType.E ){
      let id = this.edges_1.length ? this.edges_1[this.edges_1.length-1].id + 1 : 0
      let new_edge = new Edge(id, this, start, end, type, badge)

      this.getNodeById(start).edges_1_out.push(id)
      this.getNodeById(end).edges_1_in.push(id)
  
      this.edges_1.push( new_edge )
  
      await new Promise(f => setTimeout(f, 100));
  
      document.getElementById( "edge-1-"+id+"-path" )!.addEventListener('mousedown', (e) => {
        if ( this.tool == Tool.HAND &&  e.button == 0 ){
          var int = setInterval(() => {
            //<-- actions when we hold the button
            if ( this.settings.dragging_enabled ){
              if ( !this.isEdge1Flipped(id) ){
                let x0 = this.getNodeById(new_edge.start_node).physical.x
                let y0 = this.getNodeById(new_edge.start_node).physical.y
  
                let dx = Math.abs( this.mouse.x - this.getNodeById(new_edge.end_node).physical.x )
                let dy = Math.abs( this.mouse.y - this.getNodeById(new_edge.end_node).physical.y )
                let c = Math.sqrt( dx*dx + dy*dy )
  
                new_edge.physical.v1_x = this.mouse.x - x0
                new_edge.physical.v1_y = this.mouse.y - y0
    
                new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.x - x0 :  new_edge.physical.v2_x
                new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.y - y0 :  new_edge.physical.v2_y
              }
              else{
                let x0 = this.getNodeById(new_edge.start_node).physical.x + new_edge.physical.width
                let y0 = this.getNodeById(new_edge.start_node).physical.y + new_edge.physical.height
  
                let dx = Math.abs( this.mouse.x - this.getNodeById(new_edge.end_node).physical.x )
                let dy = Math.abs( this.mouse.y - this.getNodeById(new_edge.end_node).physical.y )
                let c = Math.sqrt( dx*dx + dy*dy )
                
                new_edge.physical.v1_x = x0 - this.mouse.x
                new_edge.physical.v1_y = y0 - this.mouse.y
    
                new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? x0 - this.mouse.x :  new_edge.physical.v2_x
                new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? y0 - this.mouse.y :  new_edge.physical.v2_y
  
              }
            }
          }, 10)
        
          document.addEventListener("mouseup", () => {
            clearInterval(int);
          //<-- actions when we release the button
            // console.log("release")
        
          })
        }
        else if ( this.tool == Tool.EDIT && e.button == 0 ){
          this.focused_edge_1 = id
          this.settings.show_curtain = true
          this.settings.show_properties_window.edge_1 = true
        }
      });

    }
    else if ( type == EdgeType.F){
      let id = this.edges_2.length ? this.edges_2[this.edges_2.length-1].id + 1 : 0
      let new_edge = new Edge(id, this, start, end, type, badge)
      this.getNodeById(start).edges_2_out.push(id)
      this.getNodeById(end).edges_2_in.push(id)
  
      this.edges_2.push( new_edge )
  
      await new Promise(f => setTimeout(f, 100));
  
      document.getElementById( "edge-2-"+id+"-path" )!.addEventListener('mousedown', (e) => {
        if ( this.tool == Tool.HAND && e.button == 0 ){
          var int = setInterval(() => {
            //<-- actions when we hold the button
            if ( this.settings.dragging_enabled ){
              if ( !this.isEdge2Flipped(id) ){
                let x0 = this.getNodeById(new_edge.start_node).physical.x
                let y0 = this.getNodeById(new_edge.start_node).physical.y
  
                let dx = Math.abs( this.mouse.x - this.getNodeById(new_edge.end_node).physical.x )
                let dy = Math.abs( this.mouse.y - this.getNodeById(new_edge.end_node).physical.y )
                let c = Math.sqrt( dx*dx + dy*dy )
  
                new_edge.physical.v1_x = this.mouse.x - x0
                new_edge.physical.v1_y = this.mouse.y - y0
  
                new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.x - x0 :  new_edge.physical.v2_x
                new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.y - y0 :  new_edge.physical.v2_y
              }
              else{
                let x0 = this.getNodeById(new_edge.start_node).physical.x + new_edge.physical.width
                let y0 = this.getNodeById(new_edge.start_node).physical.y + new_edge.physical.height
  
                let dx = Math.abs( this.mouse.x - this.getNodeById(new_edge.end_node).physical.x )
                let dy = Math.abs( this.mouse.y - this.getNodeById(new_edge.end_node).physical.y )
                let c = Math.sqrt( dx*dx + dy*dy )
                
                new_edge.physical.v1_x = x0 - this.mouse.x
                new_edge.physical.v1_y = y0 - this.mouse.y
  
                new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? x0 - this.mouse.x :  new_edge.physical.v2_x
                new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? y0 - this.mouse.y :  new_edge.physical.v2_y
  
              }
            }
          }, 10)
        
          document.addEventListener("mouseup", () => {
            clearInterval(int);
          //<-- actions when we release the button
            // console.log("release")
        
          })
        }
        else if ( this.tool == Tool.EDIT && e.button == 0 ){
          this.focused_edge_2 = id
          this.settings.show_curtain = true
          this.settings.show_properties_window.edge_2 = true
        }
      });
    }

  }

  deleteNode( id:number ){
    let n = this.getNodeById(id)

    for (let e of n.edges_1_in ){
      this.deleteEdge1(e)
    }
    for (let e of n.edges_1_out ){
      this.deleteEdge1(e)
    }
    for (let e of n.edges_2_in ){
      this.deleteEdge2(e)
    }
    for (let e of n.edges_2_out ){
      this.deleteEdge2(e)
    }

    this.focused_node = -1
    this.nodes = this.nodes.filter( obj => obj.id !== id )
  }

  deleteEdge1( id:number ){
    let e = this.getEdge1ById(id)
    let start_node = this.getNodeById(e.start_node)
    let end_node = this.getNodeById(e.end_node)
    
    start_node.edges_1_out = start_node.edges_1_out.filter( obj => obj !== id )
    end_node.edges_1_in = end_node.edges_1_in.filter( obj => obj !== id )

    this.focused_edge_1 = -1
    this.edges_1 = this.edges_1.filter( obj => obj.id !== id )
  }

  deleteEdge2( id:number ){
    let e = this.getEdge2ById(id)
    let start_node = this.getNodeById(e.start_node)
    let end_node = this.getNodeById(e.end_node)
    
    start_node.edges_2_out = start_node.edges_2_out.filter( obj => obj !== id )
    end_node.edges_2_in = end_node.edges_2_in.filter( obj => obj !== id )

    this.focused_edge_2 = -1
    this.edges_2 = this.edges_2.filter( obj => obj.id !== id )
  }

  isEdge1Flipped(e : number) : boolean{
    let edge = this.getEdge1ById(e)
    let x1 = this.getNodeById(edge  .start_node).physical.x
    let x2 = this.getNodeById(edge.end_node).physical.x
    return x1 > x2
  }

  isEdge2Flipped(e : number) : boolean{
    let edge = this.getEdge2ById(e)
    let x1 = this.getNodeById(edge.start_node).physical.x
    let x2 = this.getNodeById(edge.end_node).physical.x
    return x1 > x2
  }

  isEdge1LongEnough(e :number) : boolean{
    let edge = this.getEdge1ById(e)
    let dx = Math.abs( this.getNodeById(edge.start_node).physical.x - this.getNodeById(edge.end_node).physical.x )
    let dy = Math.abs( this.getNodeById(edge.start_node).physical.y - this.getNodeById(edge.end_node).physical.y )
    let c = Math.sqrt( dx*dx + dy*dy )

    return c > this.settings.physical.node_size 
  }

  isEdge2LongEnough(e :number) : boolean{
    let edge = this.getEdge2ById(e)
    let dx = Math.abs( this.getNodeById(edge.start_node).physical.x - this.getNodeById(edge.end_node).physical.x )
    let dy = Math.abs( this.getNodeById(edge.start_node).physical.y - this.getNodeById(edge.end_node).physical.y )
    let c = Math.sqrt( dx*dx + dy*dy )

    return c > this.settings.physical.node_size 
  }

  async flipSelection(n : number){
    if ( this.tool != Tool.ADDEDGE1 && this.tool != Tool.ADDEDGE2 ) return
    if ( this.isSelected(n) ){
      this.selected_nodes = this.selected_nodes.filter(x => x != n)
    }
    else{
      this.selected_nodes.push(n)
    }
    if ( this.selected_nodes.length == 2 ) {
      // @TODO: handle add edge
      if ( this.tool == Tool.ADDEDGE1 ){
        let e = this.edges_1.length ? this.edges_1[this.edges_1.length - 1].id + 1 : 0
        this.addEdge(this.selected_nodes[0],this.selected_nodes[1], EdgeType.E )
        this.focused_edge_1 = e
        this.settings.show_curtain = true
        this.settings.show_properties_window.edge_1 = true
      }
      else{ // if ( this.tool == Tool.ADDEDGE2 ){
        let e = this.edges_2.length ? this.edges_1[this.edges_2.length - 1].id + 1 : 0
        this.addEdge(this.selected_nodes[0],this.selected_nodes[1], EdgeType.F )
        this.focused_edge_2 = e
        this.settings.show_curtain = true
        this.settings.show_properties_window.edge_2 = true
      }
      this.selected_nodes = []
    }
  }

  isSelected(n : number): boolean{
    let out = this.selected_nodes.filter(x => x == n) // only 1 because we store id's
    return out.length > 0 ? true : false
  }

  setTool(t: Tool){
    this.tool = t
    if ( this.tool != Tool.ADDEDGE1 && this.tool != Tool.ADDEDGE2 ){
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
    else if ( this.tool == Tool.ADDEDGE1 || this.tool != Tool.ADDEDGE2 ){
      if ( x == 'canvas' ) return 'default'
      else if ( x == 'node' ) return 'pointer'
      else if ( x == 'edge' ) return 'default'
    }
    return ""
  }

  closeCurtainAndPropertiesWindows(){
    this.settings.show_curtain = false
    this.settings.show_properties_window.node = false
    this.settings.show_properties_window.edge_1 = false
    this.settings.show_properties_window.edge_2 = false
    this.deletion_locked = true
  }

  getEdgeTag(x:number): string{
    if ( x == 1 ){
      return EDGE_1_TAG
    }
    return EDGE_2_TAG // if x==2
  }

  getInputValueAsString(event : Event) : string {
    return (event.target as HTMLInputElement).value;
  }

  getInputValueAsNumber(event : Event) : number {
    return (event.target as HTMLInputElement).value as unknown as number;
  }

  proceedDeletion(element_type: string){
    if ( this.deletion_locked ){
      this.deletion_locked = false
      return 
    }

    // if ( this.deletion_locked == false ) { ...
    if ( element_type == 'node'){
      this.deleteNode(this.focused_node)
    }
    else if ( element_type == "edge_1" ){
      this.deleteEdge1(this.focused_edge_1)
    }
    else if ( element_type == "edge_2" ){
      this.deleteEdge2(this.focused_edge_2)
    }
    this.closeCurtainAndPropertiesWindows()
  }
}

export class Mouse {
  x: number;
  y: number;

  constructor(){
    this.x = 0
    this.y = 0
  }

}

export class Node{
  id : number;
  badge : Badge;

  edges_1_out : number[] = []
  edges_1_in : number[] = []
  edges_2_out : number[] = []
  edges_2_in : number[] = []

  physical = {
    x : window.innerWidth/2,
    y : window.innerHeight/2,
    height : 0,
    width : 0
  } as PhysicalNodeProperties

  constructor(n: number, d: number, x: number, y: number, badge ?: Badge){
    this.id =  n    
    this.physical.x = x
    this.physical.y = y
    this.physical.width = d
    this.physical.height = d
    if ( badge ){
      this.badge = badge
    }
    else{
      let b = {
        text: NODE_TAG,
        sub: n.toString(),
        sup: ""
      } as Badge
      this.badge = b
    }
  }
}

export interface PhysicalNodeProperties{
  x : number;
  y : number;
  height : number;
  width : number;
}

export class Edge{
  id : number;
  type : EdgeType;
  badge : Badge;

  start_node: number;
  end_node: number;

  physical = {
    x : window.innerWidth/2,
    y : window.innerHeight/2,
    height : 0,
    width : 0,
    v1_x : 0,
    v1_y : 0,
    v2_x : 0,
    v2_y : 0
  } as PhysicalEdgeProperties

  constructor(n: number, parent : AppComponent, start:number, end:number, type: EdgeType, badge?: Badge){
    this.id =  n   
    this.start_node = start 
    this.end_node = end 
    this.type = type

    this.physical.x = parent.getNodeById(start).physical.x
    this.physical.y = parent.getNodeById(start).physical.y

    let dx = parent.getNodeById(start).physical.x - parent.getNodeById(end).physical.x
    let dy = parent.getNodeById(start).physical.y - parent.getNodeById(end).physical.y
    
    this.physical.width -= dx
    this.physical.height -= dy

    if ( badge ){
      this.badge = badge
    }
    else if ( type == EdgeType.E ){
      let b = {
        text: EDGE_1_TAG,
        sub: n.toString(),
        sup: ""
      } as Badge
      this.badge = b
    }
    else { //} if ( type == EdgeType.F ){
      let b = {
        text: EDGE_2_TAG,
        sub: n.toString(),
        sup: ""
      } as Badge
      this.badge = b
    }
  }
  
}

export interface PhysicalEdgeProperties{
  x : number;
  y : number;
  height : number;
  width : number;
  v1_x : number;
  v1_y : number;
  v2_x : number;
  v2_y : number;
}

export interface Badge{
  text: string;
  sub: string;
  sup: string;
}
