import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, MapPin, Search, Globe, Upload } from "lucide-react";
import { mockBlockedCodes, type BlockedPostalCode } from "@/lib/mockData";
import { 
  getPostalCodesByCountry, 
  getPostalCodesByCity, 
  getUniqueCities, 
  getUniqueAreas,
  searchPostalCodes,
  type PostalCodeArea 
} from "@/lib/postalCodes";

export function DeliveryAreas() {
  const [blockedCodes, setBlockedCodes] = useState<BlockedPostalCode[]>(mockBlockedCodes);
  const [newPostalCode, setNewPostalCode] = useState("");
  const [newAreaCode, setNewAreaCode] = useState("");
  const [bulkPostalCodes, setBulkPostalCodes] = useState("");
  const [bulkAreaCodes, setBulkAreaCodes] = useState("");
  
  // Postal code reference state
  const [selectedCountry, setSelectedCountry] = useState<string>("Singapore");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const addPostalCode = () => {
    if (newPostalCode.length === 6 && /^\d{6}$/.test(newPostalCode)) {
      const newCode: BlockedPostalCode = {
        id: Date.now().toString(),
        code: newPostalCode,
        type: 'postal'
      };
      setBlockedCodes([...blockedCodes, newCode]);
      setNewPostalCode("");
    }
  };

  const addBulkPostalCodes = () => {
    if (!bulkPostalCodes.trim()) return;
    
    // Split by comma and clean up each code
    const codes = bulkPostalCodes
      .split(',')
      .map(code => code.trim())
      .filter(code => code.length === 6 && /^\d{6}$/.test(code))
      .filter(code => !blockedCodes.some(blocked => blocked.code === code && blocked.type === 'postal'));
    
    if (codes.length === 0) return;
    
    const newCodes: BlockedPostalCode[] = codes.map(code => ({
      id: Date.now().toString() + Math.random(),
      code,
      type: 'postal'
    }));
    
    setBlockedCodes([...blockedCodes, ...newCodes]);
    setBulkPostalCodes("");
  };

  const addAreaCode = () => {
    if (newAreaCode.length === 2 && /^\d{2}$/.test(newAreaCode)) {
      const newCode: BlockedPostalCode = {
        id: Date.now().toString(),
        code: newAreaCode,
        type: 'area'
      };
      setBlockedCodes([...blockedCodes, newCode]);
      setNewAreaCode("");
    }
  };

  const addBulkAreaCodes = () => {
    if (!bulkAreaCodes.trim()) return;
    
    // Split by comma and clean up each code
    const codes = bulkAreaCodes
      .split(',')
      .map(code => code.trim())
      .filter(code => code.length === 2 && /^\d{2}$/.test(code))
      .filter(code => !blockedCodes.some(blocked => blocked.code === code && blocked.type === 'area'));
    
    if (codes.length === 0) return;
    
    const newCodes: BlockedPostalCode[] = codes.map(code => ({
      id: Date.now().toString() + Math.random(),
      code,
      type: 'area'
    }));
    
    setBlockedCodes([...blockedCodes, ...newCodes]);
    setBulkAreaCodes("");
  };

  const removeCode = (id: string) => {
    setBlockedCodes(blockedCodes.filter(code => code.id !== id));
  };

  const postalCodes = blockedCodes.filter(code => code.type === 'postal');
  const areaCodes = blockedCodes.filter(code => code.type === 'area');

  // Get filtered postal codes for reference
  const getFilteredPostalCodes = (): PostalCodeArea[] => {
    if (searchQuery) {
      return searchPostalCodes(searchQuery);
    }
    
    let filteredCodes = getPostalCodesByCountry(selectedCountry);
    
    if (selectedCity && selectedCity !== "all") {
      filteredCodes = filteredCodes.filter(code => code.city === selectedCity);
    }
    
    if (selectedArea && selectedArea !== "all") {
      filteredCodes = filteredCodes.filter(code => code.area === selectedArea);
    }
    
    return filteredCodes;
  };

  const filteredPostalCodes = getFilteredPostalCodes();
  const availableCities = getUniqueCities(selectedCountry);
  const availableAreas = getUniqueAreas(selectedCountry);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity("all");
    setSelectedArea("all");
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedArea("all");
  };

  // Count valid codes in bulk input
  const getValidBulkCodes = () => {
    if (!bulkPostalCodes.trim()) return [];
    return bulkPostalCodes
      .split(',')
      .map(code => code.trim())
      .filter(code => code.length === 6 && /^\d{6}$/.test(code))
      .filter(code => !blockedCodes.some(blocked => blocked.code === code && blocked.type === 'postal'));
  };

  const getValidBulkAreaCodes = () => {
    if (!bulkAreaCodes.trim()) return [];
    return bulkAreaCodes
      .split(',')
      .map(code => code.trim())
      .filter(code => code.length === 2 && /^\d{2}$/.test(code))
      .filter(code => !blockedCodes.some(blocked => blocked.code === code && blocked.type === 'area'));
  };

  const validBulkCodes = getValidBulkCodes();
  const validBulkAreaCodes = getValidBulkAreaCodes();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="w-6 h-6 text-olive" />
        <div>
          <h1 className="text-2xl font-bold">Delivery Areas</h1>
          <p className="text-muted-foreground">Manage delivery zones and blocked postal codes</p>
        </div>
      </div>

      <Card className="border-dust bg-dust/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🇸🇬 <span>Singapore Delivery Coverage</span>
          </CardTitle>
          <CardDescription>
            Currently serving Singapore. Block specific postal codes or entire areas to restrict delivery.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="postal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="postal">Postal Codes</TabsTrigger>
          <TabsTrigger value="area">Area Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="postal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Postal Codes</CardTitle>
              <CardDescription>
                Block specific 6-digit postal codes from delivery service. Add individual codes or bulk import multiple codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Individual Postal Code Input */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Add Individual Postal Code</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g., 018956"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button 
                    onClick={addPostalCode}
                    disabled={newPostalCode.length !== 6 || !/^\d{6}$/.test(newPostalCode)}
                    className="bg-olive hover:bg-olive/90 text-olive-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Bulk Postal Code Input */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Bulk Add Postal Codes</Label>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter multiple postal codes separated by commas (e.g., 018956, 018957, 018958, 018959, 018960)"
                    value={bulkPostalCodes}
                    onChange={(e) => setBulkPostalCodes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {validBulkCodes.length > 0 && (
                        <span className="text-green-600">
                          {validBulkCodes.length} valid code{validBulkCodes.length !== 1 ? 's' : ''} ready to add
                        </span>
                      )}
                      {bulkPostalCodes.trim() && validBulkCodes.length === 0 && (
                        <span className="text-red-600">
                          No valid codes found. Please check format (6 digits, comma-separated)
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={addBulkPostalCodes}
                      disabled={validBulkCodes.length === 0}
                      className="bg-olive hover:bg-olive/90 text-olive-foreground"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add {validBulkCodes.length > 0 ? `${validBulkCodes.length} Codes` : 'Codes'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display Blocked Codes */}
              <div className="space-y-2">
                <Label>Blocked Postal Codes ({postalCodes.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {postalCodes.map((code) => (
                    <Badge key={code.id} variant="secondary" className="flex items-center gap-2">
                      {code.code}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeCode(code.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {postalCodes.length === 0 && (
                    <p className="text-muted-foreground text-sm">No postal codes blocked</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="area" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Area Codes</CardTitle>
              <CardDescription>
                Block entire areas by their 2-digit prefix (first two digits of postal code). Add individual codes or bulk import multiple codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Individual Area Code Input */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Add Individual Area Code</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g., 01"
                      value={newAreaCode}
                      onChange={(e) => setNewAreaCode(e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <Button 
                    onClick={addAreaCode}
                    disabled={newAreaCode.length !== 2 || !/^\d{2}$/.test(newAreaCode)}
                    className="bg-olive hover:bg-olive/90 text-olive-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Bulk Area Code Input */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Bulk Add Area Codes</Label>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter multiple area codes separated by commas (e.g., 01, 02, 03, 09, 10)"
                    value={bulkAreaCodes}
                    onChange={(e) => setBulkAreaCodes(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {validBulkAreaCodes.length > 0 && (
                        <span className="text-green-600">
                          {validBulkAreaCodes.length} valid area code{validBulkAreaCodes.length !== 1 ? 's' : ''} ready to add
                        </span>
                      )}
                      {bulkAreaCodes.trim() && validBulkAreaCodes.length === 0 && (
                        <span className="text-red-600">
                          No valid area codes found. Please check format (2 digits, comma-separated)
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={addBulkAreaCodes}
                      disabled={validBulkAreaCodes.length === 0}
                      className="bg-olive hover:bg-olive/90 text-olive-foreground"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Add {validBulkAreaCodes.length > 0 ? `${validBulkAreaCodes.length} Area Codes` : 'Area Codes'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display Blocked Area Codes */}
              <div className="space-y-2">
                <Label>Blocked Area Codes ({areaCodes.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {areaCodes.map((code) => (
                    <Badge key={code.id} variant="secondary" className="flex items-center gap-2">
                      {code.code}xxxx
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeCode(code.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {areaCodes.length === 0 && (
                    <p className="text-muted-foreground text-sm">No area codes blocked</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Postal Code Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Postal Code Reference
          </CardTitle>
          <CardDescription>
            Reference postal codes for Singapore and Malaysia to help with delivery area management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                  <SelectItem value="Malaysia">🇲🇾 Malaysia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {availableCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Area</Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All areas</SelectItem>
                  {availableAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search postal codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {filteredPostalCodes.length} of {getPostalCodesByCountry(selectedCountry).length} postal codes
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCity("all");
                setSelectedArea("all");
                setSearchQuery("");
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Postal Code Reference ({filteredPostalCodes.length} results)</Label>
                <div className="text-sm text-muted-foreground">
                  {selectedCountry} 
                  {selectedCity !== "all" && ` • ${selectedCity}`}
                  {selectedArea !== "all" && ` • ${selectedArea}`}
                </div>
              </div>
              <Badge variant="outline">
                {filteredPostalCodes.length} codes
              </Badge>
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {filteredPostalCodes.map((postalCode, index) => (
                <div key={`${postalCode.code}-${index}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {postalCode.code}
                      </Badge>
                      <span className="font-medium">{postalCode.area}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {postalCode.city}
                      {postalCode.state && `, ${postalCode.state}`}
                      {postalCode.description && ` - ${postalCode.description}`}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewPostalCode(postalCode.code)}
                    className="text-xs"
                  >
                    Use Code
                  </Button>
                </div>
              ))}
              
              {filteredPostalCodes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No postal codes found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}