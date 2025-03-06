sap.ui.define(
    [
      "vcpapp/vcptimeserieshistoryv3/controller/BaseController",
      "sap/m/MessageToast",
      "sap/m/MessageBox",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "sap/ui/Device",
      "sap/ui/core/Fragment",
      'sap/ui/export/library',
      'sap/ui/export/Spreadsheet',
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
      BaseController,
      MessageToast,
      MessageBox,
      JSONModel,
      Filter,
      FilterOperator,
      Device,
      Fragment,
      exportLibrary,
      Spreadsheet
    ) {
      "use strict";
      var that, oGModel;
      var aResults;
      var Verscena;
      var currentPage = 0;
  
      var EdmType = exportLibrary.EdmType;
      return BaseController.extend("vcpapp.vcptimeserieshistoryv3.controller.Home", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         */
        onInit: function () {
          that = this;
          that.skip = 0;
          that.oGModel = this.getOwnerComponent().getModel("oGModel");
          // Declaring JSON Models and size limits
          that.oListModel = new JSONModel();
          that.oProfileModel = new JSONModel();
          that.locModel = new JSONModel();
          that.prodModel = new JSONModel();
          that.CompModel = new JSONModel();
          that.StruNodeModel = new JSONModel();
          this.variantModel = new JSONModel();
          this.viewDetails = new JSONModel();
          this.newModel = new JSONModel();
          this.newDateModel = new JSONModel();
  
          this.oListModel.setSizeLimit(5000);
          that.locModel.setSizeLimit(1000);
          that.prodModel.setSizeLimit(1000);
          that.CompModel.setSizeLimit(1000);
          that.StruNodeModel.setSizeLimit(1000);
          that.variantModel.setSizeLimit(5000);
          that.viewDetails.setSizeLimit(5000);
          that.newDateModel.setSizeLimit(5000);
  
          // Declaring Value Help Dialogs
          this._oCore = sap.ui.getCore();
          if (!this._valueHelpDialogLoc) {
            this._valueHelpDialogLoc = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.LocDialog",
              this
            );
            this.getView().addDependent(this._valueHelpDialogLoc);
          }
          if (!this._valueHelpDialogProd) {
            this._valueHelpDialogProd = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.ProdDialog",
              this
            );
            this.getView().addDependent(this._valueHelpDialogProd);
          }
          if (!this._valueHelpDialogVers) {
            this._valueHelpDialogVers = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.CharacDes",
              this
            );
            this.getView().addDependent(this._valueHelpDialogVers);
          }
          if (!this._nameFragment) {
            this._nameFragment = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.NameVariant",
              this
            );
            this.getView().addDependent(this._nameFragment);
          }
          if (!this._popOver) {
            this._popOver = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.PopOver",
              this
            );
            this.getView().addDependent(this._popOver);
          }
          if (!this.CustGroupFrag) {
            this.CustGroupFrag = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.CustomerGrp",
              this
            );
            this.getView().addDependent(this.CustGroupFrag);
          }
  
  
  
          //router
          this.getRouter()
            .getRoute("Home")
            .attachPatternMatched(this._onPatternMatched.bind(this));
          //  that.getEnable();
  
        },
        closeBatchFragment: function () {
          if (that.newDialogFragment) {
            that.newDialogFragment.destroy();
            that.newDialogFragment = "";
          }
        },
  
  
        /*
         * Called when the URL matches pattern "Home".
         */
        _onPatternMatched: function () {
          that = this;
          that.deletedArray = [];
          that.oList = this.byId("orderList");
          this.oLoc = this.byId("idloc");
          this.oProd = this.byId("prodInput");
          that.oCustList = that.byId("idCust");  
          that._valueHelpDialogProd.setTitleAlignment("Center");
          that._valueHelpDialogLoc.setTitleAlignment("Center");
          that._valueHelpDialogVers.setTitleAlignment("Center");
          if (!this._manageVariant) {
            this._manageVariant = sap.ui.xmlfragment(
              "vcpapp.vcptimeserieshistoryv3.view.VariantNames",
              this
            );
            this.getView().addDependent(this._manageVariant);
          }

          that.oCustList = that._oCore.byId(
            that.CustGroupFrag.getId() + "-list"
          );
          this.oProdList = this._oCore.byId(
            this._valueHelpDialogProd.getId() + "-list"
          );
          this.oLocList = this._oCore.byId(
            this._valueHelpDialogLoc.getId() + "-list"
          );
          this.oCompList = this._oCore.byId(
            this._valueHelpDialogVers.getId() + "-list"
          );
  
          that.oList.removeSelections();
          // Calling function
          this.getData();
        },
  
        /**
         * Getting Data Initially and binding to Locations dialog
         */
        //get data;
        getData: function () {
          that.getOwnerComponent().getModel("BModel").read("/getUserPreferences", {
            filters: [
              new Filter("PARAMETER", FilterOperator.EQ, "MAX_RECORDS")
            ],
            success: function (oData) {
              that.oGModel.setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);
              

            },
            error: function (oData, error) {
              console.log(error)
            },
          });
          // that.version();
          that.oGModel = this.getOwnerComponent().getModel("oGModel");
          sap.ui.core.BusyIndicator.show();
          this.getModel("BModel").read("/getDemandLoc", {
            success: function (oData) {
              that.locModel.setData(oData);
              that.oLocList.setModel(that.locModel);
              sap.ui.core.BusyIndicator.hide();
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("error");
            
            },
          });
        },
        //#Variant Code Start//
        getVariantData: function () {
          var ndData = [];
          var dData = [], uniqueName = [];
          that.uniqueName = [];
          var oModel = that.getOwnerComponent().getModel('BModel');
          sap.ui.core.BusyIndicator.show();
        var variantUser = this.getUser();
           //  var variantUser = 'pradeepkumardaka@sbpcorp.in';
          that.oGModel.setProperty("/UserId", variantUser);
          this.getView().getModel("BModel").read("/getVariantHeader", {
            filters: [
              new Filter(
                "USER",
                FilterOperator.EQ,
                variantUser
              ),
              new Filter(
                "APPLICATION_NAME",
                FilterOperator.EQ,
                "Time Series History"
              ),
            ],
            success: function (oData) {
              if (oData.results.length === 0) {
                that.oGModel.setProperty("/variantDetails", "");
                that.oGModel.setProperty("/fromFunction", "X");
                uniqueName.unshift({
                  "VARIANTNAME": "Standard",
                  "VARIANTID": "0",
                  "DEFAULT": "Y",
                })
                that.oGModel.setProperty("/viewNames", uniqueName);
                that.oGModel.setProperty("/defaultDetails", "");
                that.viewDetails.setData({
                  items1: uniqueName
                });
                that.varianNames = uniqueName;
                sap.ui.getCore().byId("idMatList").setModel(that.viewDetails);
                sap.ui.getCore().byId("idMatList").removeSelections(true);
                if (sap.ui.getCore().byId("varNameList")) {
                  sap.ui.getCore().byId("varNameList").setModel(that.viewDetails);
                }
                var Default = "Standard";
                if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                  var newVariant = that.oGModel.getProperty("/newVariant");
                  that.handleSelectPress(newVariant[0].VARIANTNAME);
                  that.oGModel.setProperty("/newVaraintFlag", "");
                } else {
                  that.handleSelectPress(Default);
                }
                sap.ui.getCore().byId("idSave").setVisible(false);
              }
              else {
                for (var i = 0; i < oData.results.length; i++) {
                  if (oData.results[i].DEFAULT === "Y") {
                    dData.push(oData.results[i]);
                  }
                  ndData.push(oData.results[i]);
                }
  
                if (dData.length > 0) {
                  that.oGModel.setProperty("/defaultVariant", dData);
                }
                that.oGModel.setProperty("/VariantData", ndData);
  
                that.getTotalVariantDetails();
              }
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("error while loading variant details");
            },
          });
        },
        getTotalVariantDetails: function () {
          var aData = [], uniqueName = [], details = {}, defaultDetails = [], oFilters = [];
          var headerData = that.oGModel.getProperty("/VariantData");
          if (headerData.length > 0) {
            for (var i = 0; i < headerData.length; i++) {
              oFilters.push(new Filter("VARIANTID", FilterOperator.EQ, headerData[i].VARIANTID));
            }
          }
          this.getOwnerComponent().getModel("BModel").read("/getVariant", {
            filters: [oFilters],
            success: function (oData) {
              var variantNewData = oData.results;
              aData = variantNewData.map(item1 => {
                const item2 = headerData.find(item2 => item2.VARIANTID === item1.VARIANTID);
                return item2 ? { ...item1, ...item2 } : { ...item1 };
              });
              that.oGModel.setProperty("/variantDetails", aData);
              if (aData.length > 0) {
                uniqueName = that.removeDuplicate(aData, "VARIANTNAME");
                that.oGModel.setProperty("/saveBtn", "");
                for (var k = 0; k < uniqueName.length; k++) {
                  if (uniqueName[k].DEFAULT === "Y") {
                    var Default = uniqueName[k].VARIANTNAME;
                    details = {
                      "VARIANTNAME": uniqueName[k].VARIANTNAME,
                      "VARIANTID": uniqueName[k].VARIANTID,
                      "USER": uniqueName[k].USER,
                      "DEFAULT": "N"
                    };
                    defaultDetails.push(details);
                    details = {};
                  }
                }
              }
  
              that.oGModel.setProperty("/fromFunction", "X");
              if (Default) {
                uniqueName.unshift({
                  "VARIANTNAME": "Standard",
                  "VARIANTID": "0",
                  "DEFAULT": "N"
                })
                that.oGModel.setProperty("/viewNames", uniqueName);
                that.variantModel.setData({
                  items1: uniqueName
                });
                that.varianNames = uniqueName;
                that.oGModel.setProperty("/defaultDetails", defaultDetails);
                sap.ui.getCore().byId("idMatList").setModel(that.variantModel);
                sap.ui.getCore().byId("idMatList").removeSelections(true);
                if (sap.ui.getCore().byId("varNameList")) {
                  sap.ui.getCore().byId("varNameList").setModel(that.variantModel);
                }
                if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                  var newVariant = that.oGModel.getProperty("/newVariant");
                  that.handleSelectPress(newVariant[0].VARIANTNAME);
                  that.oGModel.setProperty("/newVaraintFlag", "");
                } else {
                  that.handleSelectPress(Default);
                }
              } else {
                uniqueName.unshift({
                  "VARIANTNAME": "Standard",
                  "VARIANTID": "0",
                  "DEFAULT": "Y"
                })
                that.oGModel.setProperty("/viewNames", uniqueName);
                that.oGModel.setProperty("/defaultDetails", "");
  
                that.viewDetails.setData({
                  items1: uniqueName
                });
                that.varianNames = uniqueName;
                sap.ui.getCore().byId("idMatList").setModel(that.viewDetails);
                sap.ui.getCore().byId("idMatList").removeSelections(true);
                if (sap.ui.getCore().byId("varNameList")) {
                  sap.ui.getCore().byId("varNameList").setModel(that.viewDetails);
                }
                var Default = "Standard";
                if (that.oGModel.getProperty("/newVaraintFlag") === "X") {
                  var newVariant = that.oGModel.getProperty("/newVariant");
                  that.handleSelectPress(newVariant[0].VARIANTNAME);
                  that.oGModel.setProperty("/newVaraintFlag", "");
                } else {
                  that.handleSelectPress(Default);
                }
              }
              sap.ui.getCore().byId("idSave").setVisible(false);
  
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("error while loading variant details");
            },
          });
        },
        removeDuplicate: function (array, key) {
          var check = new Set();
          return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
        },
        CustGroup:function(){
          var aSelectedLoc = that.oLocList.getSelectedItems()
            var aSelectedProd = that.oProdList.getSelectedItems();
            var  object = {}, finalArrya = [];
          for (var i = 0; i < aSelectedLoc.length; i++) {
            object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: 'EC' }
          }

          for (var i = 0; i < aSelectedProd.length; i++) {
            object.PRODUCT_ID = aSelectedProd[i].getTitle()
          }
          that.oCharNumData = [];
          finalArrya.push(object);
          this.getModel("BModel").callFunction("/getTSData", {
            method: "GET",
            urlParameters: {
              TSDATA: JSON.stringify(finalArrya)
            },
              success: function (oData) {
                if (oData.getTSData) {
                  that.CustData =  JSON.parse(oData.getTSData);
                  that.oCustModel = new JSONModel()
                  that.oCustModel.setData({
                    results:that.CustData
                  })
                  sap.ui.getCore().byId("idCustomerGrp").setModel(that.oCustModel)
                  sap.ui.core.BusyIndicator.hide()
                }
                else {
                  sap.ui.core.BusyIndicator.hide()
                  MessageToast.show("No customer group available for the selected Location/Product")
                }
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide()
                MessageToast.show("error");
              },
            });
  
        },
  
        /**
         * This function is called when click on Value help on Input box.
         * In this function based in sId will open the dialogs.
         * @param {object} oEvent -the event information.
         */
        handleValueHelp: function (oEvent) {
          var sId = oEvent.getParameter("id");
          // Loc Dialog
  
          // if(that.oLocList.getSelectedItems().length >0){
          //   //  that.oLocList.getSelectedItems().removeAllTokens();
          //   // that.byId("idloc").removeAllTokens()
          // }
          if (sId.includes("loc")) {
            that._valueHelpDialogLoc.open();
            // Prod Dialog
          } else if (sId.includes("prod")) {
            if (that.byId("idloc").getTokens().length <= 0) {
              MessageToast.show("Please select a Location")
            } else {
              that._valueHelpDialogProd.open();
            }
  
            // Component Dialog
          } else if (sId.includes("idChar")) {
            if (that.byId("idloc").getTokens().length <= 0 || that.byId("prodInput").getTokens().length <= 0) {
              MessageToast.show("Please select a Location  and Product")
            }
             else {
              that._valueHelpDialogVers.open();
            }  
            // Structure Dialog
          }else if(sId.includes("idCust")){
            if (that.byId("idloc").getTokens().length <= 0 || that.byId("prodInput").getTokens().length <= 0) {
              MessageToast.show("Please select a Location  and Product")
            }
             else {
            that.CustGroupFrag.open();
             }
          }
        },
  
        /**
         * Called when 'Close/Cancel' button in any dialog is pressed.
         * In this function based in sId will close the dialogs.
         */
        //close;
        handleClose: function (oEvent) {
          var sId = oEvent.getParameter("id");
          // Loc Dialog
          if (sId.includes("Loc")) {
            that._oCore
              .byId(this._valueHelpDialogLoc.getId() + "-searchField")
              .setValue("");
            if (that.oLocList.getBinding("items")) {
              that.oLocList.getBinding("items").filter([]);
            }
            // Prod Dialog
          } else if (sId.includes("prod")) {
            that._oCore
              .byId(this._valueHelpDialogProd.getId() + "-searchField")
              .setValue("");
            if (that.oProdList.getBinding("items")) {
              that.oProdList.getBinding("items").filter([]);
            }
            // Component Dialog
          } else if (sId.includes("idChar")) {
            that._oCore
              .byId(this._valueHelpDialogVers.getId() + "-searchField")
              .setValue("");
            if (that.oCompList.getBinding("items")) {
              that.oCompList.getBinding("items").filter([]);
            }
  
            // structure Dialog
          }
        },
  
        /**
         * Called when something is entered into the search field.
         * @param {object} oEvent -the event information.
         */
        handleSearch: function (oEvent) {
          var sQuery =
            oEvent.getParameter("value") || oEvent.getParameter("newValue"),
            sId = oEvent.getParameter("id"),
            oFilters = [];
          // Check if search filter is to be applied
          sQuery = sQuery ? sQuery.trim() : "";
          // Location
          if (sId.includes("Loc")) {
            if (sQuery !== "") {
              oFilters.push(
                new Filter({
                  filters: [
                    new Filter("DEMAND_LOC", FilterOperator.Contains, sQuery),
                    new Filter("DEMAND_DESC", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                })
              );
            }
            that.oLocList.getBinding("items").filter(oFilters);
            // Product
          } else if (sId.includes("prod")) {
            if (sQuery !== "") {
              oFilters.push(
                new Filter({
                  filters: [
                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                    new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                })
              );
            }
            that.oProdList.getBinding("items").filter(oFilters);
            // Component
          } else if (sId.includes("Comp")) {
            if (sQuery !== "") {
              oFilters.push(
                new Filter({
                  filters: [
                    new Filter("COMPONENT", FilterOperator.Contains, sQuery),
                    new Filter("ASMB_DESC", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                })
              );
            }
            that.oCompList.getBinding("items").filter(oFilters);
  
          }
          else if (sId.includes("StruSlctList")) {
            if (sQuery !== "") {
              oFilters.push(
                new Filter({
                  filters: [
                    new Filter("STRUC_NODE", FilterOperator.Contains, sQuery),
                    new Filter("COMPONENT", FilterOperator.Contains, sQuery),
                  ],
                  and: false,
                })
              );
            }
            that.oStruNodeList.getBinding("items").filter(oFilters);
  
          }
          else if (sId.includes("GenSearch")) {
            if (sQuery !== "") {
              oFilters.push(
                new Filter({
                  filters: [
                    new Filter("VARIANTNAME", FilterOperator.Contains, sQuery),
                    new Filter("USER", FilterOperator.Contains, sQuery)
                    // new Filter("SCOPE", FilterOperator.Contains, sQuery)
                  ],
                  and: false,
                })
              );
            }
            sap.ui.getCore().byId("varNameList").getBinding("items").filter(oFilters);
          }
        },
  
        /**
         * This function is called when selection on dialogs list.
         * Selections will be made based on sId.
         * @param {object} oEvent -the event information.
         */
        handleSelection: function (oEvent) {
          var sId = oEvent.getParameter("id"),
            oItem = oEvent.getParameter("selectedItems"),
            aSelectedItems,
            aODdata = [];
  
          if (sId.includes("Loc")) {
            sap.ui.core.BusyIndicator.show()
            this.oProd = that.byId("idloc");
            var aSelectedLoc = oEvent.getParameter("selectedItems");
            // Removing selections of component 
            this.oProdL = that.byId("prodInput")
            this.oComp = that.byId("idChar")
            that.byId("fromDate").setEditable(false);
            that.oListtab = new JSONModel([]);
            that.byId("onTabSearch").setValue("");  
            that.byId("orderList").setModel(that.oListtab)
            this._valueHelpDialogVers
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
  
            that.oProdL.removeAllTokens();
            that.oComp.removeAllTokens();
            that.oProdList.removeSelections();
            that.oCompList.removeSelections();
  
            if (aSelectedLoc && aSelectedLoc.length > 0) {
              that.oProd.removeAllTokens();
              aSelectedLoc.forEach(function (oItem) {
                that.oProd.addToken(
                  new sap.m.Token({
                    key: oItem.getDescription(),
                    text: oItem.getTitle(),
                    editable: false
                  })
                );
              });
  
              var aSelectedLoc = that.oLocList.getSelectedItems();
            var oFilters = [];
            for (var i = 0; i < aSelectedLoc.length; i++) {
              var object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: "P" }
            }
            that.getAllProducts(object);

  
            } else {
              that.oProd.removeAllTokens();
            }
          }
          else if (sId.includes("prod")) {
            that.oSelectedProd = oEvent.getParameter("selectedItems");
            that.loadCharNumData();
            that.CustGroup();
            // Component List
          }
          else if (sId.includes("CharaDes")) {
            sap.ui.core.BusyIndicator.show()
            that.oComp = that.byId("idChar");
            that.oListtab = new JSONModel([]);
            that.byId("onTabSearch").setValue("");
            that.byId("orderList").setModel(that.oListtab)
            var aSelectedComp = oEvent.getParameter("selectedItems");
            if (aSelectedComp && aSelectedComp.length > 0) {
              that.oComp.removeAllTokens();
              aSelectedComp.forEach(function (oItem) {
                that.oComp.addToken(
                  new sap.m.Token({
                    key: oItem.getTitle(),
                    text: oItem.getTitle(),
                    editable: false
                  })
                );
              });  
              var aSelectedChar = that.oCompList.getSelectedItems();
              var dailyFullDates = [];
              var dates = that.oCharNumData.filter(id=>id.CHAR_NUM === aSelectedChar[0].getTitle());
              if(dates.length>0){
              dates.forEach((el, i) => {
                let value = el.CAL_DATE;
                // let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
                let obj = {};
                obj.DATE = value;
                obj.key = value;
                dailyFullDates.push(obj);
              });
              var totalArrya = dailyFullDates.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
              that.newDateModel.setData({ resultsCombos: totalArrya });
              that.byId("fromDate").setModel(that.newDateModel);
              that.byId("fromDate").setEditable(true);
            }
            else{
              MessageToast.show("No dates available for selected Characteristic number")
              that.newDateModel.setData({ resultsCombos: [] });
              that.byId("fromDate").setModel(that.newDateModel);
              that.byId("fromDate").setEditable(false);
            }
              sap.ui.core.BusyIndicator.hide()
            } else {
              sap.ui.core.BusyIndicator.hide()
              that.oComp.removeAllTokens();
            }
  
          }
          else if(sId.includes("idCustomerGrp")){            
            that.oComp = that.byId("idCust");
            var aSelectedComp = oEvent.getParameter("selectedItems");
            if (aSelectedComp && aSelectedComp.length > 0) {
              that.oComp.removeAllTokens();
              aSelectedComp.forEach(function (oItem) {
                that.oComp.addToken(
                  new sap.m.Token({
                    key: oItem.getTitle(),
                    text: oItem.getTitle(),
                    editable: false
                  })
                );
              });
            }
          }
          that.handleClose(oEvent);
         
        },
  
        loadCharNumData: function () {
       //   sap.ui.core.BusyIndicator.show()
          this.oProd = that.byId("prodInput");
          this.oComp = that.byId("idChar")
          that.oListtab = new JSONModel([]);
          that.oComp.setModel(that.oListtab);
          that.oComp.removeAllTokens()
          that.oCompList.removeSelections();
          that.oListtab = new JSONModel([]);
          that.byId("onTabSearch").setValue("")
  
          that.byId("orderList").setModel(that.oListtab);
          var aSelectedProd = that.oSelectedProd //oEvent.getParameter("selectedItems");
          // Removing selections of component   
          if (aSelectedProd && aSelectedProd.length > 0) {
            that.oProd.removeAllTokens();
            aSelectedProd.forEach(function (oItem) {
              that.oProd.addToken(
                new sap.m.Token({
                  key: oItem.getDescription(),
                  text: oItem.getTitle(),
                  editable: false
                })
              );
            });
  
            var aSelectedLoc = that.oLocList.getSelectedItems()
            var aSelectedProd = that.oProdList.getSelectedItems();
  
            // Declaration of filters
            var oFilters = [], object = {}, finalArrya = [];
          for (var i = 0; i < aSelectedLoc.length; i++) {
            object = { LOCATION_ID: aSelectedLoc[i].getTitle(), FLAG: 'CC' }
          }

          for (var i = 0; i < aSelectedProd.length; i++) {
            object.PRODUCT_ID = aSelectedProd[i].getTitle()
          }
          that.oCharNumData = [];
          finalArrya.push(object);
          this.getModel("BModel").callFunction("/getTSData", {
            method: "GET",
            urlParameters: {
              TSDATA: JSON.stringify(finalArrya)
            },
              success: function (oData) {
                if (JSON.parse(oData.getTSData).length) {
                  var dailyFullDates = [];
                  that.oCharNumData = JSON.parse(oData.getTSData);
                  let uniqueArray1 = that.removeDuplicate(that.oCharNumData, 'CHAR_NUM');
                  let uniqueWeekData = that.removeDuplicate(that.oCharNumData, 'CAL_DATE')
                  that.CompModel.setData({
                    results: uniqueArray1
                  })
                  that.oCompList.setModel(that.CompModel);
                  uniqueWeekData.forEach((el, i) => {
                    let value = el.CAL_DATE;
                    // let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
                    let obj = {};
                    obj.DATE = value;
                    obj.key = value;
                    dailyFullDates.push(obj);
                  });
                  var totalArrya = dailyFullDates.sort((a, b) => new Date(a.DATE) - new Date(b.DATE));
                  that.newDateModel.setData({ resultsCombos: totalArrya });
                  that.byId("fromDate").setModel(that.newDateModel);
                  that.byId("fromDate").setEditable(true);
                  sap.ui.core.BusyIndicator.hide()
                }
                else {
                  sap.ui.core.BusyIndicator.hide()
                  MessageToast.show("No Characteristics available for the selected Location/Product")
                }
              },
              error: function (oData, error) {
                sap.ui.core.BusyIndicator.hide()
                MessageToast.show("error");
              },
            });
  
          } else {
            sap.ui.core.BusyIndicator.hide()
            that.oProd.removeAllTokens();
          }
        },
  
        /**
         * This function is called when click on "Go" button after filling all Input box values.
         * @param {object} oEvent -the event information.
         */
  
        onGetData: function () {
          if (that.byId("idloc").getTokens.length <= 0 && that.byId("prodInput").getTokens().length <= 0) {
            MessageToast.show("Please select Location and Product ")
            return false
          }
          sap.ui.core.BusyIndicator.show()
          var oList = this.getView().byId("orderList");
          oList.setModel(new sap.ui.model.json.JSONModel());
          this.skip = 0;
          that.topCount = 100;
          var object = {}, finalArray = [];
          oList.setProperty("growingThreshold", 20);
          that.oList.removeSelections();
          var aSelectedLoc = that.oLocList.getSelectedItems();
          var aSelectedProd = that.byId("prodInput").getTokens()[0].getText();
          var aSelectedComp = that.oCompList.getSelectedItems();
          var aSelectedCust = that.oCustList.getSelectedItems();
  
          that.oFilters = [];
            object.LOCATION_ID = aSelectedLoc[0].getTitle();
            object.PRODUCT_ID = aSelectedProd;
  
          for (var i = 0; i < aSelectedCust.length; i++) {
            object.CUSTOMER_GROUP = aSelectedCust[0].getTitle();
          } 
  
          for (var i = 0; i < aSelectedComp.length; i++) {
            object.CHAR_NUM = aSelectedComp[0].getTitle();
          }
          if (that.byId("fromDate").getSelectedItem()) {
            object.CAL_DATE=that.byId("fromDate").getSelectedItem().getText() ;
          }
          var Flag = "HC";
        object.FLAG = Flag;
        finalArray.push(object);
        object = {};
          this.getOwnerComponent().getModel("BModel").callFunction("/getTimeSeriesData", {
            method: "GET",
            urlParameters: {
              TSDATA: JSON.stringify(finalArray)
            },
            // sap.ui.core.BusyIndicator.show()
            success: function (oData) {
              sap.ui.core.BusyIndicator.show()
              if (JSON.parse(oData.getTimeSeriesData).length) {
              //   sap.ui.core.BusyIndicator.hide()
              that.oWeekly = JSON.parse(oData.getTimeSeriesData);
  
              for (var i = 0; i < that.oWeekly.length; i++) {
                var dateString = that.oWeekly[i].CAL_DATE;
  
                // Create a Date object from the input string
                var dateObject = new Date(dateString);
  
                // Array of month names
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
                // Extract month, day, and year from the date object
                var month = monthNames[dateObject.getMonth()];
                var day = dateObject.getDate();
                var year = dateObject.getFullYear();
  
                // Construct the desired output string
                var outputDateString = month + " " + day + ", " + year;
  
                // Update the CAL_DATE property in the object
                that.oWeekly[i].CAL_DATE = outputDateString;
              }
              if (that.oWeekly.length <= 0) {
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("No Data available for selected fields")
              }
              else {
                that.oListModel.setData(that.oWeekly);
                that.oList.setModel(that.oListModel);              
                sap.ui.core.BusyIndicator.hide()
              }
            }
            else {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("No Data available for selected fields")
            }
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("error");
            },
  
          });
  
        },
        onSearch: function (oEvent) {
          var TFilter = []
          var stnlist = that.getView().byId("orderList")
          var oItemBind = stnlist.getBinding("items")
          var sValue = oEvent.getSource().getValue();
          var NewFilter = new sap.ui.model.Filter("CHAR_NUM", sap.ui.model.FilterOperator.Contains, sValue)
          TFilter.push(NewFilter)
          oItemBind.filter(TFilter)
        },
        getWeekDates: function () {
          var aSelectedLoc = that.oLocList.getSelectedItems()
          var aSelectedProd = that.oProdList.getSelectedItems();
          var aSelectedComp = that.oCompList.getSelectedItems();
          // Declaration of filters
          var oFilters = [];
  
          for (var i = 0; i < aSelectedLoc.length; i++) {
            var sFilter = new sap.ui.model.Filter({
              path: "LOCATION_ID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: aSelectedLoc[i].getTitle(),
            });
            oFilters.push(sFilter);
          }
  
          for (var i = 0; i < aSelectedProd.length; i++) {
            sFilter = new sap.ui.model.Filter({
              path: "PRODUCT_ID",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: aSelectedProd[i].getTitle(),
            });
            oFilters.push(sFilter);
          }
  
          for (var i = 0; i < aSelectedComp.length; i++) {
            sFilter = new sap.ui.model.Filter({
              path: "CHAR_NUM",
              operator: sap.ui.model.FilterOperator.EQ,
              value1: aSelectedComp[i].getTitle(),
            });
            oFilters.push(sFilter);
          }
          // if(aSelectedComp.length===0){
          this.getOwnerComponent().getModel("BModel").read("/getHistoryVCDaily", {
            filters: oFilters,
            success: function (oData) {
              var weeklFullDates = [], dailyFullDates = [];
              that.dailyDates = oData.results;
              that.weeklyDates = that.odCondData;
              that.weeklyDates.forEach((el, i) => {
                let value = el.CAL_DATE;
                let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
                let obj = {};
                obj.DATE = value1;
                obj.key = value;
                weeklFullDates.push(obj);
              });
              if (that.dailyDates.length > 0) {
                that.dailyDates.forEach((el, i) => {
                  let value = el.CAL_DATE;
                  let value1 = `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
                  let obj = {};
                  obj.DATE = value1;
                  obj.key = value;
                  dailyFullDates.push(obj);
                });
                that.dailyDates = that.removeDuplicate(dailyFullDates, 'DATE');
                that.weeklyDates = that.removeDuplicate(weeklFullDates, 'DATE');
                var totalArrya = that.weeklyDates.concat(that.dailyDates);
                totalArrya = that.removeDuplicate(totalArrya, 'DATE');
              }
              else {
                weeklFullDates = that.removeDuplicate(weeklFullDates, 'DATE')
                var totalArrya = weeklFullDates;
              }
              that.newDateModel.setData({ resultsCombos: totalArrya });
              that.byId("fromDate").setModel(that.newDateModel);
              that.byId("fromDate").setEditable(true);
              sap.ui.core.BusyIndicator.hide()
            },
            error: function (oData, error) {
              MessageToast.show("error");
              sap.ui.core.BusyIndicator.hide()
            },
          });
        },
        removeDuplicate: function (array, key) {
          var check = new Set();
          return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
        },
        createColumnConfig: function (oData) {
          var aCols = [];
          var col = that.getView().byId("orderList").getColumns();
          if (col[0].getVisible(true)) {
            aCols.push({
              label: "Date",
              property: "CAL_DATE",
              type: EdmType.String
            });
          }
  
          if (col[1].getVisible(true)) {
            aCols.push({
              label: "Location",
              type: EdmType.String,
              property: "LOCATION_ID",
              scale: 0
            });
          }
  
          if (col[2].getVisible(true)) {
            aCols.push({
              label: "Product",
              type: EdmType.String,
              property: "PRODUCT_ID"
  
            });
          }
          if (col[3].getVisible(true)) {
            aCols.push({
              label: "Char. Num",
              property: "CHAR_NUM",
              type: EdmType.String
            });
          }
          if (col[4].getVisible(true)) {
            aCols.push({
              label: "Char. Value",
              property: "CHAR_VALUE",
              type: EdmType.String
            });
          }
          if (col[5].getVisible(true)) {
            aCols.push({
              label: "Type",
              property: "TYPE",
              type: EdmType.String
            });
          }
          if (col[6].getVisible(true)) {
            aCols.push({
              label: "Group ID",
              property: "GROUP_ID",
              type: EdmType.String
            });
          }
          if (col[7].getVisible(true)) {
            aCols.push({
              label: "Row ID",
              property: "ROW",
              type: EdmType.String
            });
          }
          if (col[8].getVisible(true)) {
            aCols.push({
              label: "Char. Count",
              property: "CHAR_COUNT",
              type: EdmType.String
            });
          }
          if (col[9].getVisible(true)) {
            aCols.push({
              label: "Char. Count Rate",
              property: "CHAR_COUNT_RATE",
              type: EdmType.String
            });
          }
          if (col[10].getVisible(true)) {
            aCols.push({
              label: "Group Count",
              property: "GROUP_COUNT",
              type: EdmType.String
            });
          }
          if (col[11].getVisible(true)) {
            aCols.push({
              label: "Group Count Rate",
              property: "GROUP_COUNT_RATE",
              type: EdmType.String
            });
          }
  
          return aCols;
        },
        onDownLoadPress: function () {
          var aCols, oRowBinding, oSettings, oSheet, oTable;
          if (!this._oTable) {
            this._oTable = that.getView().byId("orderList");
          }
          oTable = this._oTable;
          var data = oTable.getModel().getData();
        if (data.length > 0) {
          var searchData = that.byId("onTabSearch").getValue();
          if (searchData) {
            data = data.filter(row => row.CHAR_NUM.toString().includes(searchData));
          }
          oRowBinding = data;
          aCols = this.createColumnConfig();
  
          var BATCH_SIZE = 500000; // Process data in chunks of 5 lakh rows
          var totalRows = data.length;
          var chunks = Math.ceil(totalRows / BATCH_SIZE);
          var fileName = "Time Series History Customer.xlsx";

          var processChunk = function (chunkIndex) {
            if (chunkIndex >= chunks) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Excel Export Completed!");
              return;
            }

            var start = chunkIndex * BATCH_SIZE;
            var end = Math.min(start + BATCH_SIZE, totalRows);
            var chunkData = data.slice(start, end);

            var oSettings = {
              workbook: {
                columns: aCols,
                hierarchyLevel: "Level"
              },
              dataSource: chunkData,
              fileName: fileName
            };
            var oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
              oSheet.destroy();
              processChunk(chunkIndex + 1); // Process the next chunk
            });
          };

          // Start exporting in chunks
          processChunk(0);
        }
        else {
          sap.ui.core.BusyIndicator.hide();
          MessageToast.show("No data to download");
        }
        },
        /**
         * This function is called when click on Assign button.
         * In this function it will open the Profile dialog to select the profiles from list
         * @param {object} oEvent -the event information.
         */
  
        /**
         * Called when 'Close/Cancel' button in any dialog is pressed.
         */
        handleProfileClose: function () {
          that.byId("orderList").removeSelections();
          sap.ui.getCore().byId("idProfSearch").setValue();
          if (that.oProfileList.getBinding("items")) {
            that.oProfileList.getBinding("items").filter([]);
          }
          that._onProfiles.close();
        },
  
        /**
         * Called when something is entered into the search field.
         * @param {object} oEvent -the event information.
         */
        handleprofileSearch: function (oEvent) {
          var sQuery =
            oEvent.getParameter("value") || oEvent.getParameter("newValue"),
            oFilters = [];
  
          if (sQuery !== "") {
            oFilters.push(
              new Filter({
                filters: [
                  new Filter("PROFILE", FilterOperator.Contains, sQuery),
                  new Filter("PRF_DESC", FilterOperator.Contains, sQuery),
                ],
                and: false,
              })
            );
          }
          that.oProfileList.getBinding("items").filter(oFilters);
        },
  
        /**
         * Called when something is entered into the search field.
         * @param {object} oEvent -the event information.
         */
  
        onNavPress: function () {
          if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
            // generate the Hash to display 
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
              target: {
                semanticObject: "VCPDocument",
                action: "Display"
              }
            })) || "";
            //Generate a  URL for the second application
            var url = window.location.href.split('#')[0] + hash;
            //Navigate to second app
            sap.m.URLHelper.redirect(url, true);
          }
        },
  
        //Variant Code//
        /**
         * Opening the NameVariant fragment on press of "SaveAs" in popover fragment.
         */
        onVariantSave: function () {
          that.byId("idDropDown").setPressed(false);
          that._popOver.close();
          that._nameFragment.open();
          sap.ui.getCore().byId("idInput").setValue();
          sap.ui.getCore().byId("idInput").setValueState("None");
          sap.ui.getCore().byId("idSaveBtn").setEnabled(true);
        },
        /**
         * Closing the namevariant fragment
         */
        onSaveClose: function () {
          that._nameFragment.close();
        },
        /**
         * Saving the VIEW on press of save in NameVariant fragment
         * @param {*} oEvent 
         */
        onCreate: function (oEvent) {
          that.byId("idDropDown").setPressed(false);
          var oEntry = { RTRCHAR: [] };
          var array = [];
          var details = {};
          var sLocation = that.byId("idloc").getTokens();
          var Field1 = that.byId("idloc").getParent().getItems()[0].getText();
          var sProduct = that.byId("prodInput").getTokens();
          var Field2 = that.byId("prodInput").getParent().getItems()[0].getText();
          var sComponent = that.byId("idChar").getTokens();
          var Field3 = that.byId("idChar").getParent().getItems()[0].getText();
          var varName = sap.ui.getCore().byId("idInput").getValue();
          var sDefault = sap.ui.getCore().byId("_IDGenCheckBox1").getSelected();
          if (sLocation.length === 0 && sProduct.length === 0 && sComponent.length === 0) {
            sap.ui.getCore().byId("_IDGenCheckBox1").setSelected(false);
            sap.ui.getCore().byId("idInput").setValue();
            that._nameFragment.close();
            return MessageToast.show("No values selected in filters Location, Product and Characteristics")
          }
          if (varName) {
            if (sDefault && that.oGModel.getProperty("/defaultDetails").length > 0) {
              var defaultChecked = "Y";
              that.getModel("BModel").callFunction("/updateVariant", {
                method: "GET",
                urlParameters: {
                  VARDATA: JSON.stringify(that.oGModel.getProperty("/defaultDetails"))
                },
                success: function (oData) {
                  MessageToast.show(oData);
                },
                error: function (error) {
                  MessageToast.show("Failed to create variant");
                },
              });
  
            }
            else if (sDefault && that.oGModel.getProperty("/defaultDetails").length === 0) {
              var defaultChecked = "Y";
            }
            else {
              var defaultChecked = "N";
            }
            for (var i = 0; i < sLocation.length; i++) {
              details = {
                Field: Field1,
                FieldCenter: sLocation[i].getKey(),
                Value: sLocation[i].getText(),
                Favourite: "N",
                Default: defaultChecked
              }
              array.push(details);
            }
  
            for (var k = 0; k < sProduct.length; k++) {
              details = {
                Field: Field2,
                FieldCenter: sProduct[k].getKey(),
                Value: sProduct[k].getText(),
                Favourite: "N",
                Default: defaultChecked
              }
              array.push(details);
            }
            for (var s = 0; s < sComponent.length; s++) {
              details = {
                Field: Field3,
                FieldCenter: sComponent[s].getKey(),
                Value: sComponent[s].getText(),
                Favourite: "N",
                Default: defaultChecked
              }
              array.push(details);
            }
  
  
            for (var j = 0; j < array.length; j++) {
              array[j].IDNAME = varName;
              array[j].App_Name = "Time Series History"
            }
  
            that.getModel("BModel").callFunction("/createVariant", {
              method: "GET",
              urlParameters: {
                Flag: "X",
                USER: that.oGModel.getProperty("/UserId"),
                VARDATA: JSON.stringify(array)
              },
              success: function (oData) {
                that.oGModel.setProperty("/newVariant", oData.results);
                that.oGModel.setProperty("/newVaraintFlag", "X");
                sap.ui.getCore().byId("_IDGenCheckBox1").setSelected(false);
                sap.ui.getCore().byId("idInput").setValue();
                that._nameFragment.close();
                that._onPatternMatched();
  
  
              },
              error: function (error) {
  
                MessageToast.show("Failed to create variant");
              },
            });
          }
          else {
            MessageToast.show("Please fill View Name");
          }
        },
        /**
         * On selection of VIEW in POPOVER fragment.
         * @param {*} oEvent 
         */
  
        handleSelectPress: function (oEvent) {
          sap.ui.core.BusyIndicator.show();
          var oLoc, oTokens = {}, finalToken = [], compToken = [], locToken = [], prodToken = [];
          that.locProdFilters = [], that.prodFilters = [], that.locFilters = [];
          that.finaloTokens = [];
          that.byId("idloc").removeAllTokens();
          that.byId("idChar").removeAllTokens();
          that.byId("prodInput").removeAllTokens();
          that.oGModel.setProperty("/finalCompTokens", []);
          that.oGModel.setProperty("/finalLocTokens", []);
          that.oGModel.setProperty("/finalProdTokens", []);
          var oTableItems = that.oGModel.getProperty("/variantDetails");
          if (that.oGModel.getProperty("/fromFunction") === "X") {
            that.oGModel.setProperty("/fromFunction", "");
            var selectedApp = oEvent;
            var listItems = sap.ui.getCore().byId("idMatList").getItems();
            for (var i = 0; i < listItems.length; i++) {
              if (listItems[i].getTitle() === oEvent) {
                listItems[i].setSelected(true);
              }
            }
            that.byId("idVariantName").setText(selectedApp);
            that.oGModel.setProperty("/variantName", selectedApp);
          }
          else {
            var selectedApp = oEvent.getParameters().listItem.getTitle();
            // var selectedApp = oEvent.getSource().getSelectedItem().getTitle();
            that.byId("idVariantName").setText(selectedApp);
            that.oGModel.setProperty("/variantName", selectedApp);
          }
          if (selectedApp !== "Standard") {
            for (var i = 0; i < oTableItems.length; i++) {
              if (selectedApp === oTableItems[i].VARIANTNAME && oTableItems[i].APPLICATION_NAME === "Time Series History") {
                if (oTableItems[i].FIELD.includes("Loc")) {
                  var oLocTemplate = new sap.m.Token({
                    key: oTableItems[i].FIELD_CENTER,
                    text: oTableItems[i].VALUE
                  });
                  locToken.push(oLocTemplate);
                  oTokens = {
                    FIELD: oTableItems[i].FIELD,
                    VALUE: oTableItems[i].VALUE
                  }
                  that.finaloTokens.push(oTokens);
                  that.oGModel.setProperty("/finalLocTokens", locToken);
                  oLocTemplate = {};
                  var sFilter = new sap.ui.model.Filter({
                    path: "LOCATION_ID",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: oTableItems[i].VALUE,
                  });
                  that.locProdFilters.push(sFilter);
                  that.locFilters.push(sFilter);
                }
                else if (oTableItems[i].FIELD.includes("Prod")) {
                  var oItemTemplate = new sap.m.Token({
                    key: oTableItems[i].FIELD_CENTER,
                    text: oTableItems[i].VALUE
                  });
                  finalToken.push(oItemTemplate);
                  oTokens = {
                    FIELD: oTableItems[i].FIELD,
                    VALUE: oTableItems[i].VALUE
                  }
                  that.finaloTokens.push(oTokens);
                  that.oGModel.setProperty("/finalProdTokens", finalToken);
                  oItemTemplate = {};
                  var sFilter = new sap.ui.model.Filter({
                    path: "PRODUCT_ID",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: oTableItems[i].VALUE,
                  });
                  that.locProdFilters.push(sFilter);
                }
                else if (oTableItems[i].FIELD.includes("Char")) {
                  var oItemCharTemplate = new sap.m.Token({
                    key: oTableItems[i].FIELD_CENTER,
                    text: oTableItems[i].VALUE
                  });
                  compToken.push(oItemCharTemplate);
                  oTokens = {
                    FIELD: oTableItems[i].FIELD,
                    VALUE: oTableItems[i].VALUE
                  }
                  that.finaloTokens.push(oTokens);
                  that.oGModel.setProperty("/finalCompTokens", compToken);
                  oItemCharTemplate = {};
                }
              }
            }
            that.byId("idloc").setTokens(locToken);
            for (var i = 0; i < locToken.length; i++) {
              for (var k = 0; k < that.oLocList.getItems().length; k++) {
                if (that.oLocList.getItems()[k].getTitle() === locToken[i].getText()) {
                  that.oLocList.getItems()[k].setSelected(true);
                }
              }
            }
            that.oProd.removeAllTokens();
            this._valueHelpDialogProd
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            this._valueHelpDialogVers
              .getAggregation("_dialog")
              .getContent()[1]
              .removeSelections();
            this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
              filters: [that.locFilters],
              success: function (oData) {
                var prodDetails = that.removeDuplicate(oData.results, 'PRODUCT_ID');
                that.prodModel.setData({ results: prodDetails });
                that.oProdList.setModel(that.prodModel);
                that.oProdList.removeSelections();
                for (var i = 0; i < finalToken.length; i++) {
                  for (var k = 0; k < that.oProdList.getItems().length; k++) {
                    if (that.oProdList.getItems()[k].getTitle() === finalToken[i].getText()) {
                      that.oProdList.getItems()[k].setSelected(true);
                    }
                  }
                }
                if (compToken && compToken.length > 0) {
                  that.byId("idChar").setTokens(compToken);
                }
                that.getoCompdetails();
                sap.ui.core.BusyIndicator.hide();
              },
              error: function (oData, error) {
                MessageToast.show("error");
                sap.ui.core.BusyIndicator.hide();
              },
            });
            that._popOver.close();
            that.byId("prodInput").setTokens(finalToken);
            that.byId("idDropDown").setPressed(false);
          }
          else {
            sap.ui.core.BusyIndicator.hide();
            that.byId("idDropDown").setPressed(false);
            that.byId("idloc").setValue("");
            sap.ui.getCore().byId("idSave").setVisible(false);
            that._popOver.close();
            that.onResetData();
          }
        },
        getoCompdetails: function () {
          var compTokens = that.oGModel.getProperty("/finalCompTokens");
          this.getOwnerComponent().getModel("BModel").read("/getHistoryVC", {
            filters: [that.locProdFilters],
            success: function (oData) {
              if (oData.results.length > 0) {
                that.odCondData = oData.results;
                let uniqueArray1 = Array.from(new Set(oData.results.map(item => item.CHAR_NUM)))
                  .map(CHAR_NUM => oData.results.find(item => item.CHAR_NUM === CHAR_NUM));
  
                that.CompModel.setData({
                  results: uniqueArray1
                })
                that.oCompList.setModel(that.CompModel);
                for (var i = 0; i < compTokens.length; i++) {
                  for (var k = 0; k < that.oCompList.getItems().length; k++) {
                    if (that.oCompList.getItems()[k].getTitle() === compTokens[i].getText()) {
                      that.oCompList.getItems()[k].setSelected(true);
                    }
                  }
                }
  
                that.getWeekDates();
              }
              else {
                sap.ui.core.BusyIndicator.hide()
                MessageToast.show("No Characteristics available for the selected Location/Product")
              }
  
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("error");
            },
          });
        }
        ,
        /**
         * Opening the VariantNames fragment on press of "Manage" in popover fragment
         * @param {*} oEvent 
         */
        onManageOpen: function (oEvent) {
          that._popOver.close();
          that.byId("idDropDown").setPressed(false);
          if (that.oGModel.getProperty("/deletedFlag") === "X") {
            if (!this._manageVariant) {
              this._manageVariant = sap.ui.xmlfragment(
                "vcpapp.vcptimeserieshistoryv3.view.VariantNames",
                this
              );
              this.getView().addDependent(this._manageVariant);
            }
            that.newModel = new JSONModel();
            that.emptyModel = new JSONModel([]);
            that.newModel.setData({ items1: that.varianNames });
            sap.ui.getCore().byId("varNameList").setModel(that.newModel);
            that._manageVariant.open();
            that.oGModel.setProperty('/deletedFlag', "");
            that.deletedArray = [];
          }
          else {
            that._manageVariant.open();
          }
        },
        /**
         * Closing the VariantNames fragment
         */
        handleManageClose: function () {
          sap.ui.getCore().byId("_IDGenSearchField1").setValue();
          if (this._manageVariant) {
            that._manageVariant.destroy(true);
            that._manageVariant = "";
            that.oGModel.setProperty('/deletedFlag', "X");
          }
        },
        /**
         * Deleting the selected view in VariantNames fragment
         * @param {*} oEvent 
         */
        onViewDelete: function (oEvent) {
          var details = {};
          var deletedItem = parseInt(oEvent.getSource().getParent().getCells()[3].getText());
          var deletedItemName = oEvent.getSource().getParent().getCells()[0].getText();
          details = {
            ID: deletedItem,
            NAME: deletedItemName
          }
          that.deletedArray.push(details);
          details = {};
          var selectedItem = oEvent.getSource().getParent();
          var source = sap.ui.getCore().byId("varNameList");
          source.removeItem(selectedItem);
          that.oGModel.setProperty('/deletedFlag', "X");
        },
        /**
         * Saving the public/private property on click of save in VariantNames fragment.
         */
        onManage: function () {
          var newSelection = {};
          var newDefault = [];
          var initalDetails = that.oGModel.getProperty("/defaultVariant");
          var oTable = sap.ui.getCore().byId("varNameList").getItems();
          if (that.deletedArray.length > 0) {
            that.deleteVariant();
          }
          for (var i = 0; i < oTable.length; i++) {
            if (oTable[i].getCells()[1].getSelected()) {
              newSelection.VARIANTID = (oTable[i].getCells()[3].getText());
              newSelection.VARIANTNAME = oTable[i].getCells()[0].getText();
              newSelection.DEFAULT = "Y";
              newDefault.push(newSelection);
              newSelection = {};
              break;
            }
          }
          if (newDefault.length === 0) {
            newSelection.VARIANTID = (oTable[0].getCells()[3].getText());
            newSelection.VARIANTNAME = oTable[0].getCells()[0].getText();
            newSelection.DEFAULT = "Y";
            newDefault.push(newSelection);
            newSelection = {};
          }
          if (initalDetails) {
            if (parseInt(newDefault[0].VARIANTID) === initalDetails[0].VARIANTID) {
              that.handleManageClose();
            }
            else if (newDefault[0].VARIANTNAME === "Standard") {
              for (i in initalDetails) {
                initalDetails[i].DEFAULT = "N"
              }
              that.getModel("BModel").callFunction("/updateVariant", {
                method: "GET",
                urlParameters: {
                  VARDATA: JSON.stringify(initalDetails)
                },
                success: function (oData) {
                  that.handleManageClose();
                  that._onPatternMatched();
                },
                error: function (error) {
                  MessageToast.show("Failed to update variant");
                },
              });
            }
            else {
  
              that.getModel("BModel").callFunction("/updateVariant", {
                method: "GET",
                urlParameters: {
                  VARDATA: JSON.stringify(newDefault)
                },
                success: function (oData) {
                  that.handleManageClose();
                  that._onPatternMatched();
                },
                error: function (error) {
                  MessageToast.show("Failed to update variant");
                },
              });
              for (i in initalDetails) {
                initalDetails[i].DEFAULT = "N"
              }
              that.getModel("BModel").callFunction("/updateVariant", {
                method: "GET",
                urlParameters: {
                  VARDATA: JSON.stringify(initalDetails)
                },
                success: function (oData) {
                  that.handleManageClose();
                  that._onPatternMatched();
                },
                error: function (error) {
                  MessageToast.show("Failed to update variant");
                },
              });
  
            }
          }
          else {
            that.getModel("BModel").callFunction("/updateVariant", {
              method: "GET",
              urlParameters: {
                VARDATA: JSON.stringify(newDefault)
              },
              success: function (oData) {
                that.handleManageClose();
                that._onPatternMatched();
              },
              error: function (error) {
                MessageToast.show("Failed to update variant");
              },
            });
          }
  
        },
        /**
         * Save the current view if any changes in the existing properties.
         */
        onSave: function () {
          var updatedDetails = {};
          var updatedArray = [];
          var selectedItem = sap.ui.getCore().byId("idMatList");
          if (selectedItem.getSelectedItem() !== null) {
            var Default = selectedItem.getSelectedItem().getBindingContext().getObject().DEFAULT;
            var VariantId = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTID;
            var VariantName = selectedItem.getSelectedItem().getBindingContext().getObject().VARIANTNAME;
  
          }
          else {
            var defaulDetails1 = that.oGModel.getProperty("/defaultDetails");
            var VariantId = defaulDetails1[0].VARIANTID;
            var VariantName = defaulDetails1[0].VARIANTNAME;
            var Default = "Y";
  
          }
  
          var sProduct = that.byId("prodInput").getTokens();
          var sLocation = that.byId("idloc").getTokens();
          var Field1 = that.byId("idloc").getParent().getItems()[0].getText();
          var Field2 = that.byId("prodInput").getParent().getItems()[0].getText();
          var sComponent = that.byId("idChar").getTokens();
          var Field3 = that.byId("idChar").getParent().getItems()[0].getText();
          if (sLocation.length === 0 && sProduct.length === 0 && sComponent.length === 0) {
            that._popOver.close();
            return MessageToast.show("No values selected in filters Location, Product and Characteristics")
          }
          if (VariantName) {
            for (var i = 0; i < sLocation.length; i++) {
              updatedDetails = {
                Field: Field1,
                FieldCenter: sLocation[i].getKey(),
                Value: sLocation[i].getText(),
                Favourite: "N",
                Default: Default
              }
              updatedArray.push(updatedDetails);
            }
  
            for (var k = 0; k < sProduct.length; k++) {
              updatedDetails = {
                Field: Field2,
                FieldCenter: sProduct[k].getKey(),
                Value: sProduct[k].getText(),
                Favourite: "N",
                Default: Default
              }
              updatedArray.push(updatedDetails);
            }
            for (var s = 0; s < sComponent.length; s++) {
              updatedDetails = {
                Field: Field3,
                FieldCenter: sComponent[s].getKey(),
                Value: sComponent[s].getText(),
                Favourite: "N",
                Default: Default
              }
              updatedArray.push(updatedDetails);
            }
  
  
            for (var j = 0; j < updatedArray.length; j++) {
              updatedArray[j].ID = VariantId;
              updatedArray[j].IDNAME = VariantName;
              updatedArray[j].App_Name = "Time Series History"
            }
  
  
            that.getModel("BModel").callFunction("/createVariant", {
              method: "GET",
              urlParameters: {
                Flag: "E",
                USER: that.oGModel.getProperty("/UserId"),
                VARDATA: JSON.stringify(updatedArray)
              },
              success: function (oData) {
                that.oGModel.setProperty("/newVariant", oData.results);
                that.oGModel.setProperty("/newVaraintFlag", "X");
                that._onPatternMatched();
                that._popOver.close();
                that.byId("idDropDown").setPressed(false);
              },
              error: function (error) {
  
                MessageToast.show("Failed to update variant");
              },
            });
          }
          else {
            MessageToast.show("Please fill View Name");
          }
        },
        /**
         * Checking if view name already exists.
         * @param {*} oEvent 
         */
        checkName: function (oEvent) {
          var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue");
          var uniqueNames = that.oGModel.getProperty("/viewNames");
          for (var i = 0; i < uniqueNames.length; i++) {
            if (sQuery === uniqueNames[i].VARIANTNAME) {
              sap.ui.getCore().byId("idInput").setValueState("Error");
              break;
            }
            else {
              sap.ui.getCore().byId("idInput").setValueState("None");
              sap.ui.getCore().byId("idSaveBtn").setEnabled(true);
            }
          }
          if (sap.ui.getCore().byId("idInput").getValueState() === "Error") {
            sap.ui.getCore().byId("idSaveBtn").setEnabled(false);
          }
        },
        /**
         * on Press of drop down button
         * @param {*} oEvent 
         */
        onDropDownPress: function (oEvent) {
          var newTokens = {};
          that.newFinalToken = [];
          var tokenLabel = ["Location", "Product", "Characterstic Number"];
          var tokenId = ["idloc", "prodInput", "idChar"];
          if (oEvent.getSource().getPressed()) {
            this._popOver.openBy(oEvent.getSource());
            var locDetails = that.byId("idloc").getTokens();
            var locDefault = that.oGModel.getProperty("/finalLocTokens");
            var productDetails = that.byId("prodInput").getTokens();
            var compDetails = that.byId("idChar").getTokens();
            var itemsDefault = that.oGModel.getProperty("/finalProdTokens");
            var compDefault = that.oGModel.getProperty("/finalCompTokens");
            var selectedID = that.byId("idVariantName").getText();
            if (selectedID !== "Standard" && that.oGModel.getProperty("/saveBtn") !== "X") {
              if (productDetails.length === itemsDefault.length && compDetails.length === compDefault.length
                && locDetails.length === locDefault.length
              ) {
                for (var i = 0; i < tokenId.length; i++) {
                  var localTokens = that.byId(tokenId[i]).getTokens();
                  if (localTokens.length > 0) {
                    for (var j = 0; j < localTokens.length; j++) {
                      newTokens = {
                        FIELD: tokenLabel[i],
                        VALUE: localTokens[j].getText()
                      }
                      that.newFinalToken.push(newTokens);
                      newTokens = {};
                    }
                  }
                }
                that.newFinalToken = that.newFinalToken.sort(that.dynamicSortMultiple("VALUE"));
                that.finaloTokens = that.finaloTokens.sort(that.dynamicSortMultiple("VALUE"));
                if (JSON.stringify(that.newFinalToken) !== JSON.stringify(that.finaloTokens)) {
                  sap.ui.getCore().byId("idSave").setVisible(true);
                  sap.ui.getCore().byId("idSave").setType("Emphasized");
                } else {
                  sap.ui.getCore().byId("idSave").setVisible(false);
                }
              }
              else {
                sap.ui.getCore().byId("idSave").setVisible(true);
                sap.ui.getCore().byId("idSave").setType("Emphasized");
              }
            }
          }
          else {
            this._popOver.close();
          }
          // }
        },
        dynamicSortMultiple: function () {
          let props = arguments;
          const that = this;
          return function (obj1, obj2) {
            var i = 0,
              result = 0,
              numberOfProperties = props.length;
            while (result === 0 && i < numberOfProperties) {
              result = that.dynamicSort(props[i])(obj1, obj2);
              i++;
            }
            return result;
          };
        },
        dynamicSort: function (property) {
          var sortOrder = 1;
          if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
          }
          return function (a, b) {
            var result =
              a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
            return result * sortOrder;
          };
        },
  
        /**
         * 
         */
        //Function to reset
        onResetData: function () {
          that.byId("idloc").removeAllTokens()
          that.byId("prodInput").removeAllTokens();
          that.byId("idChar").removeAllTokens();
          that.byId("idCust").removeAllTokens();
          that.oLocList.removeSelections();
          that.oProdList.removeSelections();
          that.oCompList.removeSelections();
          that.oCustList.removeSelections();
          var oEmpModel = new sap.ui.model.json.JSONModel([]);
          that.byId("orderList").setModel(oEmpModel);
          // that.byId("idIconTabBar").setVisible(false);
          // that.byId("idIconTabBar").setSelectedKey("Weekly")
          that.byId("onTabSearch").setValue("");
          that.byId("fromDate").setModel(oEmpModel);
          that.byId("fromDate").setEditable(false);
        },
        /**
         * To delete Variant
         */
        deleteVariant: function () {
          that.getView().getModel("BModel").callFunction("/createVariant", {
            method: "GET",
            urlParameters: {
              Flag: "D",
              USER: that.oGModel.getProperty("/UserId"),
              VARDATA: JSON.stringify(that.deletedArray)
            },
            success: function (oData) {
              that.deletedArray = [];
            },
            error: function (error) {
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("Failed to delete variant");
            }
          });
        },
        getAllProducts: function (object) {
          that.productsData = [];
          var tsArray = [];
          tsArray.push(object)
          this.getModel("BModel").callFunction("/getTSData", {
            method: "GET",
            urlParameters: {
              TSDATA: JSON.stringify(tsArray)
            },
            success: function (oData) {
              if (JSON.parse(oData.getTSData).length) {
                that.productsData = JSON.parse(oData.getTSData);
                var prodDetails = that.removeDuplicate(that.productsData, 'PRODUCT_ID');
                that.prodModel.setData({ results: prodDetails });
                that.oProdList.setModel(that.prodModel);
                sap.ui.core.BusyIndicator.hide()
              }else{
                sap.ui.core.BusyIndicator.hide();
                MessageToast.show("No Products available for selected location");
              }
              // }
            },
            error: function (oData, error) {
              sap.ui.core.BusyIndicator.hide()
              MessageToast.show("error");
            },
          });
        },
  
      });
    }
  );
  