import { Component, OnInit, HostListener, Directive } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as crypto from 'crypto-js';
import * as sjcl from 'sjcl';

import { Account, LoginModalService, Principal } from '../shared';
import { read } from 'fs';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.css',
        'dragndrop.css'
    ]
})

export class HomeComponent implements OnInit {
    account: Account;
    result: Boolean;
    steps: String[];
    modalRef: NgbModalRef;
    file: File;
    filename: String;
    filesize: number;
    transactionId: '';
    sha_calculated: String;
    error_message = 'Please provide an ID';
    error = '';
    reader = new FileReader();
    queryUrl = 'http://localhost:8080/microservicenooauth/api/getDigest?Transaction='; // TO BE MODIFIED
    public httpC: HttpClient;

    constructor(
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: JhiEventManager,
        public http: HttpClient,
    ) {
        this.httpC = http;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    /* Update when the transaction ID is modified */
    idModified(id) {
        if (id !== '') {
            this.error = '';
            this.fileSelected(this.file);
        } else {
            this.error = this.error_message;
        }
    }

    /* Main process, questionning API to compare both SHA */
    queryProcess(file: File) {
        /* Reading file to calculate SHA256 */
        this.reader.onload = (e) => {
            this.sha_calculated = crypto.SHA256(
                crypto.enc.Latin1.parse(e.target['result']))
                .toString(crypto.enc.Hex);
            if ( this.transactionId === '' ||
        !this.transactionId) {
                this.error = this.error_message;
            } else {
                this.steps.push('Querying server');
                const sha_from_bc = this.http.get(this.queryUrl + this.transactionId).subscribe(
                    (res) => {
                        const sha_receveid = res['digest'];
                        if (this.sha_calculated.toUpperCase === sha_receveid) {
                            this.result = true;
                        } else {
                            this.result = false;
                        }
                    }
                );
                console.log(sha_from_bc);
            }
        };
        this.reader.readAsBinaryString(file);
    }

    fileSelected(file) {
        /* Updating class informations with new file */
        this.steps = [];
        this.file = file;
        this.filesize = file.size;
        this.filename = file.name;
        /* Reading file to calculate SHA256 */
        this.queryProcess(file);
    }

    /* Drag Handler to update visual of drop box */
    dragHandler(event) {
        event.stopPropagation();
        event.preventDefault();
        const drop_area = document.getElementById('drop_area');
        drop_area.className = 'area drag';
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
        this.error = this.error_message;
        const drop_area = document.getElementById('drop_area');
        /* Adding event listeners */
        drop_area.addEventListener('dragover', this.dragHandler);
        drop_area.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.fileSelected(event.dataTransfer.files[0]);
        });
    }
}
