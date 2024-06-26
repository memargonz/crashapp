

import { Component, OnInit, } from '@angular/core';
import { GoogleMapsModule} from '@angular/google-maps';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';
import { CrashService } from '../../crash.service';
import {MapDialogComponent} from '../view-map-detail/mapdialog.component'
import { MatDialog } from '@angular/material/dialog';


interface IAccident {
  address: string
  description: string,
  position:  google.maps.LatLngLiteral,
  accidentDate: Date,
  estimatedCost: number
}

@Component({
  selector: 'crash-map-accident',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, RouterOutlet, GoogleMapsModule, MatExpansionModule, ReactiveFormsModule,
  ],
  templateUrl: './search-map.component.html',
  styleUrl: './search-map.component.scss',
})

export class SearchMapComponent  implements OnInit {

  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  public map!: any;
  center: google.maps.LatLngLiteral = {
    lat: 53.540235028,
    lng: -113.49818175
  };
 rectangle!: google.maps.Rectangle
 crashsites: IAccident[]  = []
  
 constructor(private crashservice:CrashService,private dialog: MatDialog ) { }

  loadAPIMapscript() {

    let loader = new Loader({
      apiKey: environment.GOOGLE_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    loader
      .importLibrary('maps').then(() => {
        this.initMap();
      })
      .catch((e) => {
      });
    loader
      .importLibrary('marker')
      .catch((e) => {
      });

  }
  infowindow! : google.maps.InfoWindow ; 
  ngOnInit() {
    // use googlemaps/js-api-loader to dynamically load google scripts, this is needed so that
    // we dont need to use google script url with exposed hardcoded API_Key in index.html
    this.loadAPIMapscript();
  }

  async initMap() {
    try {
      const map = await new google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          center: {
            lat: 53.540235028,
            lng: -113.49818175
          },
          zoom: 12,
          mapId: "C4504f8b37365c3d0"
        }
      );

      this.map = map 
      const rectangle = this.defineMapRectangle();
      this.rectangle= rectangle;
      this.defineDocumentElements(rectangle)
    }
    catch (e) { }

  }
  private defineMapRectangle(): google.maps.Rectangle {
    //let map: any = this.map;
    const bounds = {
      south: 53.523896306239294, west: -113.50921751660157, north: 53.53513824916531, east: -113.48581633251953
    };

    // Define a rectangle and set its editable property to true.
    const rectangle = new google.maps.Rectangle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.15,
      bounds: bounds,
      editable: true,
      draggable: true,
    });

    rectangle.setMap(this.map);

    // listen to changes
    ["bounds_changed", "dragstart", "drag", "dragend",].forEach((eventName) => {
      rectangle.addListener(eventName, () => {
      
      });
    });
    return rectangle;
  }
  private defineDocumentElements(rectangle: google.maps.Rectangle) {
    let map: any = this.map;
    document
      .getElementById("delete-markers")!
      .addEventListener("click", (event) => this.clearMarkers());
    document
      .getElementById("put-markers")!
      .addEventListener("click", (event) =>  this.processMarkers() 
      );

      this.map.addListener("zoom_changed", () => {
        // Get the current bounds, which reflect the bounds before the zoom.
        rectangle.setOptions({
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.15,
          map,
          bounds: rectangle.getBounds() as google.maps.LatLngBounds,
        });
      });
  
  }
  drop(): void {
    this.clearMarkers();
    for (let i = 0; i < this.crashsites.length; i++) {
      this.addMarkerWithTimeout(this.crashsites[i].position, i * 200);
    }
  }
  addMarkerWithTimeout(
    position: google.maps.LatLngLiteral,
    timeout: number
  ): void {
    let map=this.map
    window.setTimeout(() => {
      this.markers.push(
        new google.maps.marker.AdvancedMarkerElement({
          position: position,
          map,
        
        })
      );
    }, timeout);
  }
  clearMarkers(){    
        // Delete markers   
        for (let i = 0; i < this.markers.length; i++) {
          this.markers[i].map = null
        }
        this.markers = [];
       this.infowindow?.close()
   
  }
  processMarkers(){
    this.getAccidentsWithinRectangle() 
  }

  getContentInfo(){
    let startDate:Date = this.crashsites.reduce((min, site) => 
        (site.accidentDate < min? site.accidentDate : min), this.crashsites[0]?.accidentDate);
    let EndDate:Date =this.crashsites.reduce((max, site) => 
        (site.accidentDate > max ? site.accidentDate : max), this.crashsites[0]?.accidentDate);;
    let totalEstimatedCost=this.crashsites.reduce((total, site) => 
        total + site.estimatedCost, 0);
    var datePipe = new DatePipe('en-US');
      
      return (
          `<h3 class="font-bold bg-gray-500 text-white ">&nbsp;Coverage Information</h3>
          <p class="font-semibold ...">
                Accident Count:  ${this.crashsites.length} </p>
            <p class="font-semibold ...">Period: 
                ${ datePipe.transform(startDate,"yyyy-MM-dd")} to ${datePipe.transform(EndDate,"yyyy-MM-dd")}  </p>
            <p class="font-semibold ...">Total Estimated Damage: 
                ${(new CurrencyPipe('en-US')).transform(totalEstimatedCost, '')} </p>`
      )
    }

    
  putMarkers() {
  
      const carImg = document.createElement('img');
      carImg.src = '/assets/images/crash.png';
      this.clearMarkers()

      for (const crashsite of this.crashsites) {
            const AdvancedMarkerElement = this.createMarker(crashsite.position, crashsite)    
            this.markers.push(AdvancedMarkerElement)

      }

      let MapEdge:google.maps.LatLngLiteral =   {
        lat: this.rectangle.getBounds()?.toJSON().north!,
        lng:this.rectangle.getBounds()?.toJSON().west!
      }
        
 

      this.infowindow?.close()     
      this.infowindow = new google.maps.InfoWindow({
            content: this.getContentInfo(),
            position:MapEdge
        });  
        this.infowindow.open(this.map);
     
    }
  

  createMarker(position: google.maps.LatLng | google.maps.LatLngLiteral,   content?:any): google.maps.marker.AdvancedMarkerElement {
    const carImg = document.createElement('img');
    carImg.src = '/assets/images/crash.png';
    carImg.width=23;
    carImg.height=23;
    const thecontent=this.buildContent(content)
    
    var marker = new google.maps.marker.AdvancedMarkerElement({
      position: position,
      map: this.map,
      title: 'markers',
      content: content!=null? carImg : thecontent ,

    });
    marker.addListener('click', () => {
      this.openMapDialog(position.lat,position.lng)
        });
   marker.gmpClickable=true;
   return marker
 
  }

  private buildContent(crashsite: any) {
    const content = document.createElement("div");
    content.classList.add("property");
    content.innerHTML = `
      <div class="icon">
         <img src='/assets/images/crash.png' width="72%" height="72%">
         <p>{crashsite.description}</p>
      </div>
      `;
    return content;
  }
  getAccidentsWithinRectangle(){ 
    this.crashsites=[];
    this.crashservice.getAccidentsWithinRectangle(
          this.rectangle.getBounds()?.toJSON().north,
          this.rectangle.getBounds()?.toJSON().south,
          this.rectangle.getBounds()?.toJSON().east,
          this.rectangle.getBounds()?.toJSON().west,
      ).subscribe(
      (res)=>{

        const dataArray: any[] = Array.isArray(res) ? res : [res]; 
        dataArray.forEach(element => {
            this.crashsites.push(
              {
                address: element.location,
                description: '',
                position: {
                  lat: element.latitude,
                  lng: element.longitude 
                },
                accidentDate: element.accidentDate,
                estimatedCost: element.estimatedCost
             });
         
         
          });
        this.putMarkers()
      }

  )
  }
  openMapDialog(_mlat:any, m_lng:any): void {
    const dialogRef = this.dialog.open(MapDialogComponent, {
      width: '600px', 
      height: '400px', 
      data: {
        lat: _mlat,
        lng: m_lng
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Map dialog closed');
    });
  }
}
