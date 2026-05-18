import { useState, useEffect, useRef } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { uploadSettingsMedia } from "@/services/settings.service";
import { buildImageUrl } from "@/utils/image-url";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Upload, Save, Trash2, Globe, Phone, Image as ImageIcon } from "lucide-react";

export function GeneralSettingsForm() {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [storeName, setStoreName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [topHeaderText, setTopHeaderText] = useState("");
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");

  // Endereço
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [complement, setComplement] = useState("");
  const [hideAddress, setHideAddress] = useState(false);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const numberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || "");
      setLogoUrl(settings.logoUrl || null);
      setFaviconUrl(settings.faviconUrl || null);
      setTopHeaderText(settings.topHeaderText || "");
      setBannerUrls(settings.bannerUrls || []);
      setPhone(settings.phone || "");
      setInstagram(settings.instagram || "");

      // Endereço
      setCep(settings.cep || "");
      setStreet(settings.street || "");
      setNumber(settings.number || "");
      setNeighborhood(settings.neighborhood || "");
      setCity(settings.city || "");
      setState(settings.state || "");
      setComplement(settings.complement || "");
      setHideAddress(!!settings.hideAddress);
    }
  }, [settings]);

  // Máscaras de entrada
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .substring(0, 9);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/g, "$1-$2")
      .substring(0, 15);
  };

  // Busca do CEP via ViaCEP
  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatCEP(rawValue);
    setCep(formatted);

    const cleanCep = formatted.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();

        if (data.erro) {
          toast({
            variant: "destructive",
            title: "Erro no CEP",
            description: "CEP não encontrado na base de dados.",
          });
          return;
        }

        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");

        toast({
          title: "Endereço preenchido",
          description: "Endereço localizado e autopreenchido com sucesso!",
        });

        // Focar no campo de número após autopreenchimento
        setTimeout(() => {
          numberInputRef.current?.focus();
        }, 100);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Erro na busca",
          description: "Não foi possível consultar o CEP.",
        });
      }
    }
  };

  // Uploads
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const res = await uploadSettingsMedia(file);
      setLogoUrl(res.url);
      toast({ title: "Logo atualizada com sucesso!" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Falha ao enviar a imagem do logo.",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFavicon(true);
      const res = await uploadSettingsMedia(file);
      setFaviconUrl(res.url);
      toast({ title: "Favicon atualizado com sucesso!" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Falha ao enviar a imagem do favicon.",
      });
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (bannerUrls.length >= 7) {
      toast({
        variant: "destructive",
        title: "Limite de banners atingido",
        description: "Você só pode adicionar até 7 banners promocionais.",
      });
      return;
    }

    try {
      setIsUploadingBanner(true);
      const res = await uploadSettingsMedia(file);
      setBannerUrls((prev) => [...prev, res.url]);
      toast({ title: "Banner adicionado com sucesso!" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Falha ao enviar o banner promocional.",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = (index: number) => {
    setBannerUrls((prev) => prev.filter((_, i) => i !== index));
    toast({ title: "Banner removido." });
  };

  const handleSave = async () => {
    if (!storeName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "O Nome da Loja é obrigatório.",
      });
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        storeName,
        logoUrl,
        faviconUrl,
        topHeaderText,
        bannerUrls,
        phone,
        instagram,
        cep,
        street,
        number,
        neighborhood,
        city,
        state,
        complement,
        hideAddress,
      });

      toast({
        title: "Configurações atualizadas!",
        description: "As informações da loja foram salvas no banco com sucesso.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao atualizar as configurações gerais.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5 text-center text-muted-foreground">
          Carregando configurações gerais...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Identidade e Endereço da Loja</h2>
          <Button size="sm" onClick={handleSave} disabled={updateSettingsMutation.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {updateSettingsMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {/* Identidade Visual */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identidade Visual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-medium">Logo da Loja</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border overflow-hidden">
                  {logoUrl ? (
                    <img src={buildImageUrl(logoUrl)} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline font-medium">
                  <Upload className="h-4 w-4" /> {isUploadingLogo ? "Enviando..." : "Enviar nova logo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Favicon (Ícone do Navegador)</Label>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center border overflow-hidden">
                  {faviconUrl ? (
                    <img src={buildImageUrl(faviconUrl)} alt="Favicon" className="h-full w-full object-cover" />
                  ) : (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline font-medium">
                  <Upload className="h-4 w-4" /> {isUploadingFavicon ? "Enviando..." : "Enviar favicon"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} disabled={isUploadingFavicon} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Top Header Text e Banners */}
        <div className="space-y-4">
          <div>
            <Label className="font-medium">Texto de Destaque no Topo</Label>
            <Input
              value={topHeaderText}
              onChange={(e) => setTopHeaderText(e.target.value)}
              placeholder="Ex: Entrega Grátis acima de R$ 150!"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Banners Promocionais (Até 7 Imagens)</Label>
              <span className="text-xs text-muted-foreground">{bannerUrls.length}/7 banners</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bannerUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border bg-muted group">
                  <img src={buildImageUrl(url)} alt={`Banner ${idx + 1}`} className="h-full w-full object-cover" />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveBanner(idx)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {bannerUrls.length < 7 && (
                <label className="flex flex-col items-center justify-center aspect-video rounded-lg border border-dashed hover:bg-muted cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {isUploadingBanner ? "Enviando..." : "Enviar Banner"}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={isUploadingBanner} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Contato & Redes Sociais */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contato &amp; Redes Sociais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-medium">Nome da Loja</Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Pode Mais"
              />
            </div>
            <div>
              <Label className="font-medium">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="font-medium">Instagram</Label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Ex: @sualoja"
            />
          </div>
        </div>

        {/* Endereço Físico */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Endereço</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="font-medium">CEP (Autopreenchimento)</Label>
              <Input
                value={cep}
                onChange={handleCEPChange}
                placeholder="00000-000"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="font-medium">Rua / Logradouro</Label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Logradouro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label className="font-medium">Número</Label>
              <Input
                ref={numberInputRef}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Nº"
              />
            </div>
            <div>
              <Label className="font-medium">Bairro</Label>
              <Input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Bairro"
              />
            </div>
            <div>
              <Label className="font-medium">Cidade</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label className="font-medium">Estado</Label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="UF"
              />
            </div>
          </div>

          <div>
            <Label className="font-medium">Complemento</Label>
            <Input
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              placeholder="Ex: Bloco A, Sala 4"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Switch checked={hideAddress} onCheckedChange={setHideAddress} />
            <Label className="font-normal text-sm cursor-pointer select-none" onClick={() => setHideAddress(!hideAddress)}>
              Ocultar endereço físico na loja pública
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
