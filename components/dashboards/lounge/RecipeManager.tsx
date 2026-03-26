"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Settings2,
  Package,
  Layers,
  Save,
  Trash2,
  ChevronRight,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { 
    getFnbProducts, 
    getFnbCategories, 
    getFnbInventoryStatus,
    createFnbProduct,
    createFnbCategory,
    updateFnbProduct,
    deleteFnbProduct
} from "@/lib/api"
import { toast } from "sonner"

export function RecipeManager() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    ingredients: [] as any[]
  })
  
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  const [selectedIngredient, setSelectedIngredient] = useState<string>("")
  const [ingredientQty, setIngredientQty] = useState<string>("")
  const [newCategoryName, setNewCategoryName] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [prods, cats, inv] = await Promise.all([
        getFnbProducts(),
        getFnbCategories(),
        getFnbInventoryStatus()
      ])
      setProducts(prods || [])
      setCategories(cats || [])
      setInventoryItems(inv || [])
    } catch (err) {
      console.error("Error fetching recipe data:", err)
      toast.error("Failed to load management data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddIngredient = (isEdit: boolean = false) => {
    if (!selectedIngredient || !ingredientQty || parseFloat(ingredientQty) <= 0) {
        toast.error("Set valid ingredient and quantity")
        return
    }
    const invItem = inventoryItems.find(i => i.id.toString() === selectedIngredient)
    if (!invItem) return

    if (isEdit) {
        if (editingProduct.ingredients.some((i: any) => i.inventory_product === parseInt(selectedIngredient))) {
            toast.error("Ingredient already in recipe")
            return
        }
        setEditingProduct((prev: any) => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    inventory_product: parseInt(selectedIngredient),
                    inventory_product_name: invItem.name,
                    quantity_consumed: parseFloat(ingredientQty)
                }
            ]
        }))
    } else {
        if (newProduct.ingredients.some(i => i.inventory_product === parseInt(selectedIngredient))) {
            toast.error("Ingredient already in recipe")
            return
        }
        setNewProduct(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    inventory_product: parseInt(selectedIngredient),
                    inventory_product_name: invItem.name,
                    quantity_consumed: parseFloat(ingredientQty)
                }
            ]
        }))
    }
    setSelectedIngredient("")
    setIngredientQty("")
  }

  const handleRemoveIngredient = (idx: number, isEdit: boolean = false) => {
    if (isEdit) {
        setEditingProduct((prev: any) => ({
            ...prev,
            ingredients: prev.ingredients.filter((_: any, i: number) => i !== idx)
        }))
    } else {
        setNewProduct(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== idx)
        }))
    }
  }

  const updateIngredientQuantity = (idx: number, newQty: string, isEdit: boolean = false) => {
    const qty = parseFloat(newQty) || 0
    if (isEdit) {
        setEditingProduct((prev: any) => ({
            ...prev,
            ingredients: prev.ingredients.map((ing: any, i: number) => 
                i === idx ? { ...ing, quantity_consumed: qty } : ing
            )
        }))
    } else {
        setNewProduct(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((ing, i) => 
                i === idx ? { ...ing, quantity_consumed: qty } : ing
            )
        }))
    }
  }

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
        toast.error("Missing required fields")
        return
    }
    
    setIsLoading(true)
    try {
        await createFnbProduct({
            name: newProduct.name,
            category: parseInt(newProduct.category),
            price: parseFloat(newProduct.price),
            ingredients: newProduct.ingredients.map(ing => ({
                inventory_product: ing.inventory_product,
                quantity_consumed: ing.quantity_consumed
            }))
        })
        toast.success("Product blueprint registered")
        setIsProductModalOpen(false)
        setNewProduct({ name: "", category: "", price: "", ingredients: [] })
        fetchData()
    } catch (err) {
        toast.error("Failed to register product")
    } finally {
        setIsLoading(false)
    }
  }

  const handleEditClick = (product: any) => {
    setEditingProduct({
        id: product.id,
        name: product.name,
        category: product.category?.toString() || "",
        price: product.price?.toString() || "",
        ingredients: product.ingredients || []
    })
    setIsEditProductModalOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct.name || !editingProduct.category || !editingProduct.price) {
        toast.error("Missing required fields")
        return
    }

    setIsLoading(true)
    try {
        await updateFnbProduct(editingProduct.id, {
            name: editingProduct.name,
            category: parseInt(editingProduct.category),
            price: parseFloat(editingProduct.price),
            ingredients: editingProduct.ingredients.map((ing: any) => ({
                inventory_product: ing.inventory_product,
                quantity_consumed: ing.quantity_consumed
            }))
        })
        toast.success("Product updated successfully")
        setIsEditProductModalOpen(false)
        setEditingProduct(null)
        fetchData()
    } catch (err) {
        toast.error("Failed to update product")
    } finally {
        setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setIsLoading(true)
    try {
        await deleteFnbProduct(productToDelete)
        toast.success("Product deleted successfully")
        setIsDeleteDialogOpen(false)
        setProductToDelete(null)
        fetchData()
    } catch (err) {
        toast.error("Failed to delete product")
    } finally {
        setIsLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName) return
    try {
        await createFnbCategory({ name: newCategoryName })
        toast.success("Category created")
        setIsCategoryModalOpen(false)
        setNewCategoryName("")
        fetchData()
    } catch (err) {
        toast.error("Failed to create category")
    }
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    Recipe Manager
                    <Settings2 className="h-6 w-6 text-primary" />
                </h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Configure menu architecture and deduction logic</p>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="h-10 border-border/60 font-bold text-xs uppercase tracking-widest px-6 rounded-xl hover:bg-muted"
                >
                    <Layers className="mr-2 h-4 w-4" /> Categories
                </Button>
                <Button 
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-10 px-6 rounded-xl shadow-lg shadow-primary/10 transition-all border-b-2 border-primary/70 active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Product
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
            <Card className="lg:col-span-3 bg-card border-border/60 flex flex-col overflow-hidden shadow-sm">
                <CardHeader className="shrink-0 border-b border-border/60 bg-muted/20">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.1em] flex items-center justify-between">
                        Categories
                        <Badge variant="secondary" className="font-mono text-[9px]">{categories.length}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full">
                        <div className="p-2 space-y-1">
                            {categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <span className="text-sm font-bold text-foreground">{cat.name}</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-[10px] text-center py-10 text-muted-foreground font-black uppercase italic opacity-30">Empty Namespace</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="lg:col-span-9 bg-card border-border/60 flex flex-col overflow-hidden shadow-sm">
                <CardHeader className="shrink-0 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black tracking-tight">Product Architecture</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Active blueprints for Diva Lounge</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input placeholder="Filter products..." className="h-8 w-48 text-[10px] bg-background border-border/40" />
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Filter className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                            {products.map((prod) => (
                                <Card key={prod.id} className="bg-muted/30 border-border/40 hover:border-primary/40 transition-all border-dashed">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-sm font-black text-foreground">{prod.name}</h4>
                                                <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/20 text-primary bg-primary/5 px-2 mt-1">{prod.category_name}</Badge>
                                            </div>
                                            <span className="text-xs font-black text-primary">ETB {prod.price}</span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Recipe Matrix</p>
                                            <div className="space-y-1">
                                                {prod.ingredients && prod.ingredients.length > 0 ? (
                                                    prod.ingredients.map((ing: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-[10px] font-bold pb-1 border-b border-border/20 last:border-0">
                                                            <span className="text-muted-foreground">{ing.inventory_product_name}</span>
                                                            <span className="text-foreground">{ing.quantity_consumed} Units</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[9px] italic text-muted-foreground/50">No ingredients defined</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleEditClick(prod)}
                                                className="h-8 flex-1 text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => handleDeleteClick(prod.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
            <DialogContent className="max-w-3xl bg-card border-border/60 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight">Create Menu Product</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Product Name</Label>
                            <Input 
                                placeholder="e.g. Blue Lagoon" 
                                className="bg-muted/50 border-border/60" 
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</Label>
                            <Select 
                                value={newProduct.category} 
                                onValueChange={(val) => setNewProduct({...newProduct, category: val})}
                            >
                                <SelectTrigger className="bg-muted/50 border-border/60"><SelectValue placeholder="Select namespace" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">List Price (ETB)</Label>
                            <Input 
                                placeholder="0.00" 
                                type="number" 
                                className="bg-muted/50 border-border/60 font-mono" 
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 flex flex-col min-w-0">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4 flex items-center justify-between">
                            Deduction Logic
                            <Package className="h-3 w-3" />
                        </h4>
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex gap-2 mb-4 shrink-0">
                                <Select 
                                    value={selectedIngredient} 
                                    onValueChange={setSelectedIngredient}
                                >
                                    <SelectTrigger className="flex-1 h-10 text-[10px] font-bold bg-background border-border/60"><SelectValue placeholder="Select Ingredient" /></SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {inventoryItems.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input 
                                    placeholder="Qty" 
                                    className="w-16 h-10 text-[10px] font-bold bg-background border-border/60 shrink-0" 
                                    type="number" 
                                    value={ingredientQty}
                                    onChange={(e) => setIngredientQty(e.target.value)}
                                />
                                <Button size="icon" className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-xl shrink-0" onClick={() => handleAddIngredient(false)}>
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            <ScrollArea className="flex-1 -mx-2 px-2">
                                <div className="space-y-2">
                                    <p className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-[0.2em] mb-2 px-1">Recipe Matrix</p>
                                    {newProduct.ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-background p-3 rounded-xl border border-border/40 text-[10px] font-bold animate-in fade-in slide-in-from-left-2 duration-300 group min-w-0 gap-2">
                                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                <span className="truncate text-foreground block">{ing.inventory_product_name}</span>
                                                <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Inventory Item</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Input 
                                                    type="number" 
                                                    className="w-14 h-7 text-[10px] font-black bg-primary/5 text-primary border-primary/10 text-center px-1 shrink-0"
                                                    value={ing.quantity_consumed}
                                                    onChange={(e) => updateIngredientQuantity(idx, e.target.value, false)}
                                                />
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all shrink-0" 
                                                    onClick={() => handleRemoveIngredient(idx, false)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {newProduct.ingredients.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/20 rounded-2xl opacity-40">
                                            <Package className="h-8 w-8 mb-2 text-muted-foreground" />
                                            <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest italic">Empty Deduction Logic</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed pt-4 italic font-bold">
                            Adding ingredients here will cause automatic FIFO stock deduction whenever this product is sold.
                        </p>
                    </div>
                </div>
                <DialogFooter aria-disabled={isLoading}>
                    <Button variant="ghost" onClick={() => setIsProductModalOpen(false)} className="text-muted-foreground px-8 font-bold uppercase text-[10px]">Cancel</Button>
                    <Button onClick={handleCreateProduct} disabled={isLoading} className="bg-primary text-primary-foreground font-black px-12 rounded-xl h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
                        {isLoading ? "Finalizing Blueprint..." : "Finalize Blueprint"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Edit Product Modal */}
        <Dialog open={isEditProductModalOpen} onOpenChange={setIsEditProductModalOpen}>
            <DialogContent className="max-w-3xl bg-card border-border/60 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight">Edit Menu Product</DialogTitle>
                </DialogHeader>
                {editingProduct && (
                    <div className="flex flex-col gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Product Name</Label>
                                <Input 
                                    className="bg-muted/50 border-border/60" 
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category</Label>
                                <Select 
                                    value={editingProduct.category} 
                                    onValueChange={(val) => setEditingProduct({...editingProduct, category: val})}
                                >
                                    <SelectTrigger className="bg-muted/50 border-border/60"><SelectValue placeholder="Select namespace" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">List Price (ETB)</Label>
                                <Input 
                                    type="number" 
                                    className="bg-muted/50 border-border/60 font-mono" 
                                    value={editingProduct.price}
                                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 flex flex-col min-w-0">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4 flex items-center justify-between">
                                Deduction Logic
                                <Package className="h-3 w-3" />
                            </h4>
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex gap-2 mb-4 shrink-0">
                                    <Select 
                                        value={selectedIngredient} 
                                        onValueChange={setSelectedIngredient}
                                    >
                                        <SelectTrigger className="flex-1 h-10 text-[10px] font-bold bg-background border-border/60"><SelectValue placeholder="Select Ingredient" /></SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {inventoryItems.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Input 
                                        placeholder="Qty" 
                                        className="w-16 h-10 text-[10px] font-bold bg-background border-border/60 shrink-0" 
                                        type="number" 
                                        value={ingredientQty}
                                        onChange={(e) => setIngredientQty(e.target.value)}
                                    />
                                    <Button size="icon" className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-xl shrink-0" onClick={() => handleAddIngredient(true)}>
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </div>
                                
                                <ScrollArea className="flex-1 -mx-2 px-2">
                                    <div className="space-y-2">
                                        <p className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-[0.2em] mb-2 px-1">Recipe Matrix</p>
                                        {editingProduct.ingredients.map((ing: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between bg-background p-3 rounded-xl border border-border/40 text-[10px] font-bold animate-in fade-in slide-in-from-left-2 duration-300 group min-w-0 gap-2">
                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                    <span className="truncate text-foreground block">{ing.inventory_product_name}</span>
                                                    <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Inventory Item</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Input 
                                                        type="number" 
                                                        className="w-14 h-7 text-[10px] font-black bg-primary/5 text-primary border-primary/10 text-center px-1 shrink-0"
                                                        value={ing.quantity_consumed}
                                                        onChange={(e) => updateIngredientQuantity(idx, e.target.value, true)}
                                                    />
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all shrink-0" 
                                                        onClick={() => handleRemoveIngredient(idx, true)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {editingProduct.ingredients.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/20 rounded-2xl opacity-40">
                                                <Package className="h-8 w-8 mb-2 text-muted-foreground" />
                                                <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest italic">Empty Deduction Logic</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter className="pt-6 border-t border-border/40 mt-4">
                    <Button variant="ghost" onClick={() => setIsEditProductModalOpen(false)} className="text-muted-foreground px-8 font-bold uppercase text-[10px]">Cancel</Button>
                    <Button onClick={handleUpdateProduct} disabled={isLoading} className="bg-primary text-primary-foreground font-black px-12 rounded-xl h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
                        {isLoading ? "Updating Architecture..." : "Update Blueprint"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md bg-card border-border/60">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight text-destructive">Deconstruct Blueprint?</DialogTitle>
                    <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest pt-2">
                        This action will permanently remove this product and its associated deduction logic from the Diva Lounge menu.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                        <Trash2 className="h-10 w-10 text-destructive" />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="ghost" className="flex-1 font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsDeleteDialogOpen(false)}>Abort</Button>
                    <Button variant="destructive" className="flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl" onClick={handleConfirmDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Confirm Deletion"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Categories Modal */}
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogContent className="max-w-md bg-card border-border/60">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight uppercase tracking-tighter flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" /> Menu Namespaces
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Manage product categorization groups
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Category Name</Label>
                        <div className="flex gap-2">
                            <Input 
                                placeholder="e.g. Signature Cocktails" 
                                className="bg-muted/50 border-border/60 h-11 font-bold"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <Button onClick={handleCreateCategory} className="bg-primary px-6 rounded-xl font-black h-11 shadow-lg shadow-primary/10">Add</Button>
                        </div>
                    </div>
                    <ScrollArea className="h-[200px] -mx-2 px-2">
                        <div className="space-y-2">
                            {categories.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/20 transition-all">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-black text-foreground uppercase tracking-tight">{c.name}</span>
                                        <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Active Namespace</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-none">Online</Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="w-full font-bold uppercase text-[10px] tracking-widest border border-border/60 rounded-xl hover:bg-muted font-black">Close Registry</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
