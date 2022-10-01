import { Component } from '@angular/core';

//////////////////////////////

const NODE_TAG = "n"
const EDGE_1_TAG = "e"
const EDGE_2_TAG = "f"

//////////////////////////////

enum EdgeType { E, F }
enum Tool { HAND, ADDNODE, ADDEDGE, EDIT }
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'graph-playground';

  settings = {
    dragging_enabled: true,

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

  selected_nodes : number[] = []

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
        alert(this.mouse.x+" "+this.mouse.y)
      }
    });

    this.addNode()
    this.addNode()
    this.addNode()
    this.addNode({text:"bage", sub:"", sup:"4"})
    
    this.addEdge(0, 1, EdgeType.E)
    this.addEdge(0, 2, EdgeType.E)
    this.addEdge(1, 3, EdgeType.E)
    this.addEdge(2, 3, EdgeType.E)
    
    this.addEdge(3, 2, EdgeType.F)
    this.addEdge(3, 0, EdgeType.F)
    this.addEdge(2, 0, EdgeType.F, {text:"text", sub:"sub", sup:"sup"})
  }

  public async addNode(badge?: Badge){
    let id = this.nodes.length
    let new_node = new Node(id, this.settings.physical.node_size, badge)

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
              let dx = new_node.physical.x - this.edges_1[new_node.edges_1_out[i]].physical.x
              let dy = new_node.physical.y - this.edges_1[new_node.edges_1_out[i]].physical.y

              this.edges_1[new_node.edges_1_out[i]].physical.x = new_node.physical.x
              this.edges_1[new_node.edges_1_out[i]].physical.y = new_node.physical.y
              
              this.edges_1[new_node.edges_1_out[i]].physical.width -= dx
              this.edges_1[new_node.edges_1_out[i]].physical.height -= dy
            }
            for( let i=0; i< new_node.edges_1_in.length; i++ ){
              let dw = new_node.physical.x - this.edges_1[new_node.edges_1_in[i]].physical.x
              let dh = new_node.physical.y - this.edges_1[new_node.edges_1_in[i]].physical.y
              
              this.edges_1[new_node.edges_1_in[i]].physical.width = dw
              this.edges_1[new_node.edges_1_in[i]].physical.height = dh
              
            }

            for( let i=0; i< new_node.edges_2_out.length; i++ ){
              let dx = new_node.physical.x - this.edges_2[new_node.edges_2_out[i]].physical.x
              let dy = new_node.physical.y - this.edges_2[new_node.edges_2_out[i]].physical.y

              this.edges_2[new_node.edges_2_out[i]].physical.x = new_node.physical.x
              this.edges_2[new_node.edges_2_out[i]].physical.y = new_node.physical.y
              
              this.edges_2[new_node.edges_2_out[i]].physical.width -= dx
              this.edges_2[new_node.edges_2_out[i]].physical.height -= dy
            }
            for( let i=0; i< new_node.edges_2_in.length; i++ ){
              let dw = new_node.physical.x - this.edges_2[new_node.edges_2_in[i]].physical.x
              let dh = new_node.physical.y - this.edges_2[new_node.edges_2_in[i]].physical.y
              
              this.edges_2[new_node.edges_2_in[i]].physical.width = dw
              this.edges_2[new_node.edges_2_in[i]].physical.height = dh
              
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
        alert("Node details")
      }

    });
  }

  public async addEdge(start:number, end:number, type: EdgeType, badge?: Badge){
    // @FIXME: merge this if's
    if ( type == EdgeType.E ){
      let id = this.edges_1.length
      let new_edge = new Edge(id, start, end, type, badge)

      this.nodes[start].edges_1_out.push(id)
      this.nodes[end].edges_1_in.push(id)
  
      this.edges_1.push( new_edge )
  
      await new Promise(f => setTimeout(f, 100));
  
      document.getElementById( "edge-1-"+id+"-path" )!.addEventListener('mousedown', (e) => {
        if ( this.tool == Tool.HAND &&  e.button == 0 ){
          var int = setInterval(() => {
            //<-- actions when we hold the button
            if ( this.settings.dragging_enabled ){
              if ( !this.isEdge1Flipped(id) ){
                let x0 = this.nodes[new_edge.start_node].physical.x
                let y0 = this.nodes[new_edge.start_node].physical.y
  
                let dx = Math.abs( this.mouse.x - this.nodes[new_edge.end_node].physical.x )
                let dy = Math.abs( this.mouse.y - this.nodes[new_edge.end_node].physical.y )
                let c = Math.sqrt( dx*dx + dy*dy )
  
                new_edge.physical.v1_x = this.mouse.x - x0
                new_edge.physical.v1_y = this.mouse.y - y0
    
                new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.x - x0 :  new_edge.physical.v2_x
                new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.y - y0 :  new_edge.physical.v2_y
              }
              else{
                let x0 = this.nodes[new_edge.start_node].physical.x + new_edge.physical.width
                let y0 = this.nodes[new_edge.start_node].physical.y + new_edge.physical.height
  
                let dx = Math.abs( this.mouse.x - this.nodes[new_edge.end_node].physical.x )
                let dy = Math.abs( this.mouse.y - this.nodes[new_edge.end_node].physical.y )
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
          alert("Edge details")
        }
      });

    }
    else if ( type == EdgeType.F){
      let id = this.edges_2.length
      let new_edge = new Edge(id, start, end, type, badge)
      this.nodes[start].edges_2_out.push(id)
      this.nodes[end].edges_2_in.push(id)
  
      this.edges_2.push( new_edge )
  
      await new Promise(f => setTimeout(f, 100));
  
      document.getElementById( "edge-2-"+id+"-path" )!.addEventListener('mousedown', (e) => {
        if ( this.tool == Tool.HAND && e.button == 0 ){
          var int = setInterval(() => {
            //<-- actions when we hold the button
            if ( this.settings.dragging_enabled ){
              if ( !this.isEdge2Flipped(id) ){
                let x0 = this.nodes[new_edge.start_node].physical.x
                let y0 = this.nodes[new_edge.start_node].physical.y
  
                let dx = Math.abs( this.mouse.x - this.nodes[new_edge.end_node].physical.x )
                let dy = Math.abs( this.mouse.y - this.nodes[new_edge.end_node].physical.y )
                let c = Math.sqrt( dx*dx + dy*dy )
  
                new_edge.physical.v1_x = this.mouse.x - x0
                new_edge.physical.v1_y = this.mouse.y - y0
  
                new_edge.physical.v2_x = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.x - x0 :  new_edge.physical.v2_x
                new_edge.physical.v2_y = ( c > this.settings.physical.node_size * this.settings.physical.safe_distance_factor ) ? this.mouse.y - y0 :  new_edge.physical.v2_y
              }
              else{
                let x0 = this.nodes[new_edge.start_node].physical.x + new_edge.physical.width
                let y0 = this.nodes[new_edge.start_node].physical.y + new_edge.physical.height
  
                let dx = Math.abs( this.mouse.x - this.nodes[new_edge.end_node].physical.x )
                let dy = Math.abs( this.mouse.y - this.nodes[new_edge.end_node].physical.y )
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
          alert("Edge details")
        }
      });
    }

  }

  isEdge1Flipped(e : number) : boolean{
    let edge = this.edges_1[e]
    let x1 = this.nodes[edge  .start_node].physical.x
    let x2 = this.nodes[edge.end_node].physical.x
    return x1 > x2
  }

  isEdge2Flipped(e : number) : boolean{
    let edge = this.edges_2[e]
    let x1 = this.nodes[edge.start_node].physical.x
    let x2 = this.nodes[edge.end_node].physical.x
    return x1 > x2
  }

  isEdge1LongEnough(e :number) : boolean{
    let edge = this.edges_1[e]
    let dx = Math.abs( this.nodes[edge.start_node].physical.x - this.nodes[edge.end_node].physical.x )
    let dy = Math.abs( this.nodes[edge.start_node].physical.y - this.nodes[edge.end_node].physical.y )
    let c = Math.sqrt( dx*dx + dy*dy )

    return c > this.settings.physical.node_size 
  }

  isEdge2LongEnough(e :number) : boolean{
    let edge = this.edges_2[e]
    let dx = Math.abs( this.nodes[edge.start_node].physical.x - this.nodes[edge.end_node].physical.x )
    let dy = Math.abs( this.nodes[edge.start_node].physical.y - this.nodes[edge.end_node].physical.y )
    let c = Math.sqrt( dx*dx + dy*dy )

    return c > this.settings.physical.node_size 
  }

  async flipSelection(n : number){
    if ( this.tool != Tool.ADDEDGE ) return
    if ( this.isSelected(n) ){
      this.selected_nodes = this.selected_nodes.filter(x => x != n)
    }
    else{
      this.selected_nodes.push(n)
    }
    if ( this.selected_nodes.length == 2 ) {
      // @TODO: handle add edge
      await new Promise(f => setTimeout(f, 500)); // tmp

      this.selected_nodes = []
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

  constructor(n: number, d: number, badge ?: Badge){
    this.id =  n    
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

  constructor(n: number, start:number, end:number, type: EdgeType, badge?: Badge){
    this.id =  n   
    this.start_node = start 
    this.end_node = end 
    this.type = type

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
