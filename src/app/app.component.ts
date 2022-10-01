import { Component } from '@angular/core';



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
      node_size: 60,
      safe_distance_factor: 3
    }
  }

  mouse : Mouse = new Mouse;

  nodes : Node[] = [] as Node[]
  edges_1 : Edge[] = [] as Edge[]
  edges_2 : Edge[] = [] as Edge[]

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
    this.addNode()
    this.addNode()
    this.addNode()
    this.addNode()
    
    this.addEdge1(0, 1)
    this.addEdge1(0, 2)
    this.addEdge1(1, 3)
    this.addEdge1(2, 3)
    
    this.addEdge2(3, 2)
    this.addEdge2(3, 0)
    this.addEdge2(2, 0)
  }

  public async addNode(){
    let id = this.nodes.length
    let new_node = new Node(id, this.settings.physical.node_size)

    this.nodes.push( new_node )
    
    await new Promise(f => setTimeout(f, 100));

    document.getElementById( "node-"+id )!.addEventListener('mousedown', (e) => {
      if ( e.button == 0 ){
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
              // this.edges[new_node.edges_out[i]].physical.width
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
              // this.edges[new_node.edges_out[i]].physical.width
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
      else if ( e.button == 2 ){
        alert("Node details")
      }

    });
  }

  public async addEdge1(start:number, end:number){
      let id = this.edges_1.length
      let new_edge = new Edge(id, start, end, "1")
      this.nodes[start].edges_1_out.push(id)
      this.nodes[end].edges_1_in.push(id)
  
      this.edges_1.push( new_edge )

      await new Promise(f => setTimeout(f, 100));

    document.getElementById( "edge-1-"+id+"-path" )!.addEventListener('mousedown', (e) => {
      if ( e.button == 0 ){
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
      else if ( e.button == 2 ){
        alert("Edge details")
      }
    });
  }


  public async addEdge2(start:number, end:number){
    let id = this.edges_2.length
    let new_edge = new Edge(id, start, end, "2")
    this.nodes[start].edges_2_out.push(id)
    this.nodes[end].edges_2_in.push(id)

    this.edges_2.push( new_edge )

    await new Promise(f => setTimeout(f, 100));

  document.getElementById( "edge-2-"+id+"-path" )!.addEventListener('mousedown', (e) => {
    if ( e.button == 0 ){
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
    else if ( e.button == 2 ){
      alert("Edge details")
    }
  });
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

  constructor(n: number, d: number){
    this.id =  n    
    this.physical.width = d
    this.physical.height = d
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
  type : string; // A, B or C

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

  constructor(n: number, start:number, end:number, type: string){
    this.id =  n   
    this.start_node = start 
    this.end_node = end 
    this.type = type
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
